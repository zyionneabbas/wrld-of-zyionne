export default function Splash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg)' }}>

      <div className="flex flex-col items-center gap-4">
        <h1 className="text-5xl font-black tracking-wider"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-primary)',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
          WRLD
        </h1>

        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-primary)',
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>

    </div>
  )
}