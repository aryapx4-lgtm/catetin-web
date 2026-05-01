import { google, type sheets_v4 } from "googleapis"

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth env vars")
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

export type CreateSpreadsheetInput = {
  ownerName: string
  shareEmails: string[]
  monthlyIncome?: number
  needsPct?: number
  wantsPct?: number
  savingsPct?: number
}

export type CreateSpreadsheetResult = {
  spreadsheetId: string
  spreadsheetUrl: string
}

const SHEET_ID_POS = 0
const SHEET_ID_TX = 1
const SHEET_ID_GOALS = 2

export async function createUserSpreadsheet(
  input: CreateSpreadsheetInput,
): Promise<CreateSpreadsheetResult> {
  const auth = getAuth()
  const drive = google.drive({ version: "v3", auth })
  const sheets = google.sheets({ version: "v4", auth })

  const file = await drive.files.create({
    requestBody: {
      name: `Finance Bot - ${input.ownerName || "User"}`,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: ["root"],
    },
    fields: "id",
    supportsAllDrives: true,
  })
  const spreadsheetId = file.data.id
  if (!spreadsheetId) throw new Error("Failed to create spreadsheet")

  for (const email of input.shareEmails.filter(Boolean)) {
    try {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: { role: "writer", type: "user", emailAddress: email },
        sendNotificationEmail: true,
        fields: "id",
        supportsAllDrives: true,
      })
    } catch (err) {
      console.error(`[sheets] Failed to share with ${email}:`, err)
    }
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: SHEET_ID_POS, title: "Pos Keuangan" },
            fields: "title",
          },
        },
        { addSheet: { properties: { sheetId: SHEET_ID_TX, title: "Transaksi" } } },
        { addSheet: { properties: { sheetId: SHEET_ID_GOALS, title: "Financial Goals" } } },
      ],
    },
  })

  const income = input.monthlyIncome ?? 0
  const np = input.needsPct ?? 50
  const wp = input.wantsPct ?? 30
  const sp = input.savingsPct ?? 20
  const posValues = buildPosKeuanganValues(income, np, wp, sp)

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Pos Keuangan!A1:H23",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: posValues },
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Transaksi!A1:I1",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "Date",
          "Transaction Name",
          "Item List",
          "Amount",
          "Notes",
          "Cashflow",
          "Category",
          "Source Bank",
          "Recorded By",
        ],
      ],
    },
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Financial Goals!A1:H1",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "Goal Name",
          "Target Amount",
          "Target Date",
          "Monthly Save",
          "Progress",
          "Status",
          "Notes",
          "Created",
        ],
      ],
    },
  })

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: buildFormatRequests() },
  })

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  }
}

export async function sharePartnerOnSpreadsheet(input: {
  spreadsheetId: string
  partnerEmail: string
}): Promise<void> {
  const auth = getAuth()
  const drive = google.drive({ version: "v3", auth })
  await drive.permissions.create({
    fileId: input.spreadsheetId,
    requestBody: { role: "writer", type: "user", emailAddress: input.partnerEmail },
    sendNotificationEmail: true,
    fields: "id",
    supportsAllDrives: true,
  })
}

function buildPosKeuanganValues(
  income: number,
  np: number,
  wp: number,
  sp: number,
): (string | number)[][] {
  const act = (cat: string) =>
    `=ARRAYFORMULA(SUM((TRIM(INDIRECT("Transaksi!$G$2:$G$3000"))="${cat}")*(TRIM(INDIRECT("Transaksi!$F$2:$F$3000"))="Expenses")*IFERROR(VALUE(REGEXREPLACE(TO_TEXT(INDIRECT("Transaksi!$D$2:$D$3000")),"[^0-9]","")),0)))`

  const totalExp = `=ARRAYFORMULA(SUM((TRIM(INDIRECT("Transaksi!$F$2:$F$3000"))="Expenses")*IFERROR(VALUE(REGEXREPLACE(TO_TEXT(INDIRECT("Transaksi!$D$2:$D$3000")),"[^0-9]","")),0)))`

  return [
    ["💰 POS KEUANGAN", "", "", "", "", "", "", ""],
    ["Pendapatan Bulanan", income, "", "Total Pengeluaran", totalExp, "", "Sisa Anggaran", "=B2-E2"],
    [""],
    ["Kelompok", "Target Induk", "Pos Keuangan", "Kategori di Transaksi", "Alokasi (%)", "Anggaran", "Realisasi", "Selisih"],

    ["KEBUTUHAN", `${np}%`, "Makanan & Minuman", "Food & Beverage", `${np}%`, "=ROUND($B$2*E5,0)", act("Food & Beverage"), "=F5-G5"],
    ["", "", "Transport", "Transport", "0%", "=ROUND($B$2*E6,0)", act("Transport"), "=F6-G6"],
    ["", "", "Tagihan & Utilitas", "Bills & Utilities", "0%", "=ROUND($B$2*E7,0)", act("Bills & Utilities"), "=F7-G7"],
    ["", "", "Kesehatan", "Health", "0%", "=ROUND($B$2*E8,0)", act("Health"), "=F8-G8"],
    ["", "", "Pendidikan", "Education", "0%", "=ROUND($B$2*E9,0)", act("Education"), "=F9-G9"],
    ["", "", "Lain-lain Kebutuhan", "Others", "0%", "=ROUND($B$2*E10,0)", act("Others"), "=F10-G10"],
    ["TOTAL KEBUTUHAN", `=${np}%`, "", "", "=SUM(E5:E10)", "=SUM(F5:F10)", "=SUM(G5:G10)", "=SUM(H5:H10)"],

    [""],

    ["KEINGINAN", `${wp}%`, "Hiburan", "Entertainment", `${wp}%`, "=ROUND($B$2*E13,0)", act("Entertainment"), "=F13-G13"],
    ["", "", "Belanja", "Shopping", "0%", "=ROUND($B$2*E14,0)", act("Shopping"), "=F14-G14"],
    ["", "", "Jajan/Cafe", "Food & Beverage", "0%", "=ROUND($B$2*E15,0)", "=0", "=F15-G15"],
    ["TOTAL KEINGINAN", `=${wp}%`, "", "", "=SUM(E13:E15)", "=SUM(F13:F15)", "=SUM(G13:G15)", "=SUM(H13:H15)"],

    [""],

    ["TABUNGAN & HUTANG", `${sp}%`, "Tabungan Darurat", "Savings", `${sp}%`, "=ROUND($B$2*E18,0)", act("Savings"), "=F18-G18"],
    ["", "", "Investasi", "Savings", "0%", "=ROUND($B$2*E19,0)", "=0", "=F19-G19"],
    ["", "", "Cicilan Hutang", "Others", "0%", "=ROUND($B$2*E20,0)", "=0", "=F20-G20"],
    ["TOTAL TABUNGAN", `=${sp}%`, "", "", "=SUM(E18:E20)", "=SUM(F18:F20)", "=SUM(G18:G20)", "=SUM(H18:H20)"],

    [""],

    ["GRAND TOTAL", "100%", "", "", "=E11+E16+E21", "=F11+F16+F21", "=G11+G16+G21", "=H11+H16+H21"],
  ]
}

function buildFormatRequests(): sheets_v4.Schema$Request[] {
  const colorBg = (
    sheetId: number,
    r: number,
    c: number,
    endR: number,
    endC: number,
    red: number,
    green: number,
    blue: number,
    bold = false,
    fontSize = 10,
    white = false,
  ): sheets_v4.Schema$Request => ({
    repeatCell: {
      range: { sheetId, startRowIndex: r, endRowIndex: endR, startColumnIndex: c, endColumnIndex: endC },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red, green, blue },
          textFormat: {
            bold,
            fontSize,
            foregroundColor: white
              ? { red: 1, green: 1, blue: 1 }
              : { red: 0.15, green: 0.15, blue: 0.15 },
          },
          verticalAlignment: "MIDDLE",
          padding: { top: 4, bottom: 4, left: 6, right: 6 },
        },
      },
      fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding)",
    },
  })

  const border = (
    sheetId: number,
    r: number,
    c: number,
    endR: number,
    endC: number,
  ): sheets_v4.Schema$Request => ({
    updateBorders: {
      range: { sheetId, startRowIndex: r, endRowIndex: endR, startColumnIndex: c, endColumnIndex: endC },
      top: { style: "SOLID_MEDIUM", color: { red: 0.4, green: 0.4, blue: 0.4 } },
      bottom: { style: "SOLID_MEDIUM", color: { red: 0.4, green: 0.4, blue: 0.4 } },
      left: { style: "SOLID_MEDIUM", color: { red: 0.4, green: 0.4, blue: 0.4 } },
      right: { style: "SOLID_MEDIUM", color: { red: 0.4, green: 0.4, blue: 0.4 } },
      innerHorizontal: { style: "SOLID", color: { red: 0.7, green: 0.7, blue: 0.7 } },
      innerVertical: { style: "SOLID", color: { red: 0.7, green: 0.7, blue: 0.7 } },
    },
  })

  const merge = (
    sheetId: number,
    r: number,
    c: number,
    endR: number,
    endC: number,
  ): sheets_v4.Schema$Request => ({
    mergeCells: {
      range: { sheetId, startRowIndex: r, endRowIndex: endR, startColumnIndex: c, endColumnIndex: endC },
      mergeType: "MERGE_ALL",
    },
  })

  const colWidth = (sheetId: number, col: number, pixels: number): sheets_v4.Schema$Request => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: col, endIndex: col + 1 },
      properties: { pixelSize: pixels },
      fields: "pixelSize",
    },
  })

  const rowHeight = (sheetId: number, row: number, pixels: number): sheets_v4.Schema$Request => ({
    updateDimensionProperties: {
      range: { sheetId, dimension: "ROWS", startIndex: row, endIndex: row + 1 },
      properties: { pixelSize: pixels },
      fields: "pixelSize",
    },
  })

  const freeze = (sheetId: number, count: number): sheets_v4.Schema$Request => ({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: count } },
      fields: "gridProperties.frozenRowCount",
    },
  })

  // Color palette
  const DB: [number, number, number] = [0.13, 0.27, 0.49]
  const LY: [number, number, number] = [1, 0.95, 0.8]
  const DG: [number, number, number] = [0.25, 0.25, 0.25]
  const LGr: [number, number, number] = [0.85, 0.94, 0.82]
  const MGr: [number, number, number] = [0.56, 0.78, 0.49]
  const LO: [number, number, number] = [1, 0.94, 0.87]
  const MO: [number, number, number] = [1, 0.76, 0.53]
  const LB: [number, number, number] = [0.81, 0.89, 0.96]
  const MB: [number, number, number] = [0.47, 0.67, 0.87]
  const GT: [number, number, number] = [0.18, 0.18, 0.18]
  const WH: [number, number, number] = [0.98, 0.98, 0.98]
  const Prp: [number, number, number] = [0.41, 0.22, 0.6]

  const reqs: sheets_v4.Schema$Request[] = [
    // Pos Keuangan column widths & row heights
    colWidth(SHEET_ID_POS, 0, 170),
    colWidth(SHEET_ID_POS, 1, 80),
    colWidth(SHEET_ID_POS, 2, 180),
    colWidth(SHEET_ID_POS, 3, 160),
    colWidth(SHEET_ID_POS, 4, 90),
    colWidth(SHEET_ID_POS, 5, 120),
    colWidth(SHEET_ID_POS, 6, 120),
    colWidth(SHEET_ID_POS, 7, 120),
    rowHeight(SHEET_ID_POS, 0, 40),
    rowHeight(SHEET_ID_POS, 1, 35),
    rowHeight(SHEET_ID_POS, 3, 30),
    merge(SHEET_ID_POS, 0, 0, 1, 8),
    colorBg(SHEET_ID_POS, 0, 0, 1, 8, ...DB, true, 14, true),
    colorBg(SHEET_ID_POS, 1, 0, 2, 8, ...LY, true, 10, false),
    colorBg(SHEET_ID_POS, 2, 0, 3, 8, ...WH, false, 10, false),
    colorBg(SHEET_ID_POS, 3, 0, 4, 8, ...DG, true, 10, true),
    colorBg(SHEET_ID_POS, 4, 0, 10, 8, ...LGr, false, 10, false),
    colorBg(SHEET_ID_POS, 4, 0, 10, 1, ...LGr, true, 10, false),
    colorBg(SHEET_ID_POS, 10, 0, 11, 8, ...MGr, true, 10, false),
    colorBg(SHEET_ID_POS, 11, 0, 12, 8, ...WH, false, 10, false),
    colorBg(SHEET_ID_POS, 12, 0, 15, 8, ...LO, false, 10, false),
    colorBg(SHEET_ID_POS, 12, 0, 15, 1, ...LO, true, 10, false),
    colorBg(SHEET_ID_POS, 15, 0, 16, 8, ...MO, true, 10, false),
    colorBg(SHEET_ID_POS, 16, 0, 17, 8, ...WH, false, 10, false),
    colorBg(SHEET_ID_POS, 17, 0, 20, 8, ...LB, false, 10, false),
    colorBg(SHEET_ID_POS, 17, 0, 20, 1, ...LB, true, 10, false),
    colorBg(SHEET_ID_POS, 20, 0, 21, 8, ...MB, true, 10, false),
    colorBg(SHEET_ID_POS, 21, 0, 22, 8, ...WH, false, 10, false),
    colorBg(SHEET_ID_POS, 22, 0, 23, 8, ...GT, true, 10, true),
    border(SHEET_ID_POS, 3, 0, 11, 8),
    border(SHEET_ID_POS, 12, 0, 16, 8),
    border(SHEET_ID_POS, 17, 0, 21, 8),
    border(SHEET_ID_POS, 22, 0, 23, 8),
    freeze(SHEET_ID_POS, 4),

    // Rupiah number format on amount columns
    {
      repeatCell: {
        range: {
          sheetId: SHEET_ID_POS,
          startRowIndex: 4,
          endRowIndex: 23,
          startColumnIndex: 5,
          endColumnIndex: 8,
        },
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: '"Rp"#,##0' } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: SHEET_ID_POS,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: 8,
        },
        cell: { userEnteredFormat: { numberFormat: { type: "NUMBER", pattern: '"Rp"#,##0' } } },
        fields: "userEnteredFormat.numberFormat",
      },
    },

    // Conditional formatting on Selisih column (red < 0, green > 0)
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId: SHEET_ID_POS,
              startRowIndex: 4,
              endRowIndex: 23,
              startColumnIndex: 7,
              endColumnIndex: 8,
            },
          ],
          booleanRule: {
            condition: { type: "NUMBER_LESS", values: [{ userEnteredValue: "0" }] },
            format: {
              textFormat: { foregroundColor: { red: 0.8, green: 0.1, blue: 0.1 }, bold: true },
            },
          },
        },
        index: 0,
      },
    },
    {
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId: SHEET_ID_POS,
              startRowIndex: 4,
              endRowIndex: 23,
              startColumnIndex: 7,
              endColumnIndex: 8,
            },
          ],
          booleanRule: {
            condition: { type: "NUMBER_GREATER", values: [{ userEnteredValue: "0" }] },
            format: { textFormat: { foregroundColor: { red: 0.1, green: 0.5, blue: 0.1 } } },
          },
        },
        index: 1,
      },
    },

    // Transaksi format
    freeze(SHEET_ID_TX, 1),
    rowHeight(SHEET_ID_TX, 0, 35),
    colWidth(SHEET_ID_TX, 0, 100),
    colWidth(SHEET_ID_TX, 1, 180),
    colWidth(SHEET_ID_TX, 2, 280),
    colWidth(SHEET_ID_TX, 3, 110),
    colWidth(SHEET_ID_TX, 4, 200),
    colWidth(SHEET_ID_TX, 5, 110),
    colWidth(SHEET_ID_TX, 6, 130),
    colWidth(SHEET_ID_TX, 7, 120),
    colorBg(SHEET_ID_TX, 0, 0, 1, 9, ...DB, true, 11, true),
    border(SHEET_ID_TX, 0, 0, 1, 9),

    // Financial Goals format
    freeze(SHEET_ID_GOALS, 1),
    rowHeight(SHEET_ID_GOALS, 0, 35),
    colWidth(SHEET_ID_GOALS, 0, 160),
    colWidth(SHEET_ID_GOALS, 1, 120),
    colWidth(SHEET_ID_GOALS, 2, 110),
    colWidth(SHEET_ID_GOALS, 3, 120),
    colWidth(SHEET_ID_GOALS, 4, 120),
    colWidth(SHEET_ID_GOALS, 5, 110),
    colWidth(SHEET_ID_GOALS, 6, 250),
    colWidth(SHEET_ID_GOALS, 7, 110),
    colorBg(SHEET_ID_GOALS, 0, 0, 1, 8, ...Prp, true, 11, true),
    border(SHEET_ID_GOALS, 0, 0, 1, 8),
  ]

  return reqs
}
