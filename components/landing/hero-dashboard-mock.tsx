export function HeroDashboardMock() {
  return (
    <svg
      viewBox="0 0 600 400"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pratinjau dashboard Catetin"
      className="w-full max-w-[500px] rounded-[20px] shadow-elevated"
    >
      <rect width="600" height="400" rx="16" fill="#FFFFFF" />
      {/* header */}
      <rect width="600" height="52" rx="16" fill="#154418" />
      <rect x="0" y="16" width="600" height="36" fill="#154418" />
      <circle cx="28" cy="26" r="6" fill="#A7E666" />
      <text x="44" y="30" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF">
        Catetin Dashboard
      </text>
      <rect x="480" y="16" width="100" height="24" rx="12" fill="rgba(255,255,255,0.15)" />
      <text x="498" y="33" fontFamily="DM Sans, sans-serif" fontSize="10" fill="rgba(255,255,255,0.8)">
        April 2026
      </text>

      {/* KPI 1 */}
      <rect x="24" y="68" width="260" height="90" rx="12" fill="#F4FFF4" />
      <rect x="24" y="68" width="260" height="3" rx="1.5" fill="#A7E666" />
      <text x="40" y="92" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#4A5E4A" letterSpacing="0.5">
        TOTAL SALDO
      </text>
      <text x="40" y="120" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="800" fill="#154418">
        Rp 8.450.000
      </text>
      <text x="40" y="142" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#1a5620">
        ▲ +12% dari bulan lalu
      </text>

      {/* KPI 2 */}
      <rect x="300" y="68" width="276" height="90" rx="12" fill="#FFF8F4" />
      <rect x="300" y="68" width="276" height="3" rx="1.5" fill="#FD8D4E" />
      <text x="316" y="92" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#4A5E4A" letterSpacing="0.5">
        PENGELUARAN BULAN INI
      </text>
      <text x="316" y="120" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="800" fill="#FD8D4E">
        Rp 3.250.000
      </text>
      <text x="316" y="142" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#4A5E4A">
        dari budget Rp 4.000.000
      </text>

      {/* CHART */}
      <rect x="24" y="178" width="340" height="198" rx="12" fill="#F8FAF8" />
      <text x="40" y="202" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700" fill="#154418">
        Pengeluaran Mingguan
      </text>
      {/* bars */}
      {[
        { x: 56, h: 60, y: 290, color: "#154418", label: "Mgg 1" },
        { x: 112, h: 90, y: 260, color: "#154418", label: "Mgg 2" },
        { x: 168, h: 50, y: 300, color: "#A7E666", label: "Mgg 3" },
        { x: 224, h: 35, y: 315, color: "#A7E666", label: "Mgg 4" },
      ].map((b) => (
        <g key={b.label}>
          <rect x={b.x} y="280" width="36" height="70" rx="4" fill="#E4EBFB" />
          <rect x={b.x} y={b.y} width="36" height={b.h} rx="4" fill={b.color} />
          <text x={b.x + 6} y="364" fontFamily="DM Sans, sans-serif" fontSize="9" fill="#4A5E4A">
            {b.label}
          </text>
        </g>
      ))}
      <rect x="280" y="280" width="36" height="70" rx="4" fill="#E4EBFB" />
      <rect
        x="280"
        y="325"
        width="36"
        height="25"
        rx="4"
        fill="#E4EBFB"
        stroke="#A7E666"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      <text x="284" y="364" fontFamily="DM Sans, sans-serif" fontSize="9" fill="#4A5E4A">
        Mgg 5
      </text>

      {/* TRANSACTIONS */}
      <rect x="380" y="178" width="196" height="198" rx="12" fill="#F8FAF8" />
      <text x="396" y="202" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700" fill="#154418">
        Transaksi Terakhir
      </text>

      {[
        { y: 230, dot: "#FFF0E6", label: "Makan Siang", value: "-Rp 35.000", valColor: "#4A5E4A", icon: "🍜" },
        { y: 274, dot: "#E8F8D8", label: "Gaji Masuk", value: "+Rp 8.500.000", valColor: "#1a5620", icon: "💰" },
        { y: 318, dot: "#E4EBFB", label: "Grab", value: "-Rp 28.000", valColor: "#4A5E4A", icon: "🚗" },
        { y: 362, dot: "#FEF3E2", label: "Kopi", value: "-Rp 42.000", valColor: "#4A5E4A", icon: "☕" },
      ].map((t, i) => (
        <g key={i}>
          <circle cx="404" cy={t.y} r="10" fill={t.dot} />
          <text x="400" y={t.y + 4} fontSize="10">
            {t.icon}
          </text>
          <text
            x="422"
            y={t.y - 2}
            fontFamily="DM Sans, sans-serif"
            fontSize="10"
            fontWeight="600"
            fill="#154418"
          >
            {t.label}
          </text>
          <text
            x="422"
            y={t.y + 12}
            fontFamily="DM Sans, sans-serif"
            fontSize="9"
            fill={t.valColor}
          >
            {t.value}
          </text>
          {i < 3 && <line x1="396" y1={t.y + 24} x2="564" y2={t.y + 24} stroke="#E8E8E8" strokeWidth="0.5" />}
        </g>
      ))}
    </svg>
  )
}
