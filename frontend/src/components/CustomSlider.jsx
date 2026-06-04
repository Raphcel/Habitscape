export default function CustomSlider({ min = 0, max = 100, step = 1, value, onChange, colorClass, thumbColorHex }) {
  // Prevent division by zero and ensure percentage is clamped between 0 and 100
  const range = max - min;
  const percentage = range > 0 ? Math.min(Math.max(((value - min) / range) * 100, 0), 100) : 0;

  return (
    <div className="relative w-full h-6 flex items-center group">
      {/* Background track (unfilled) - highly consistent, clean gray */}
      <div className="absolute w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner inset-y-auto">
        {/* Filled track */}
        <div 
          className={`h-full ${colorClass} transition-all duration-75`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Invisible Native Input for interaction */}
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="absolute w-full h-full opacity-0 cursor-pointer z-10 m-0 p-0"
      />
      
      {/* Custom Thumb */}
      <div 
        className="absolute h-5 w-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] pointer-events-none z-0 transition-transform group-hover:scale-110 flex items-center justify-center"
        style={{ 
          left: `calc(${percentage}% - 10px)`, 
          border: `2px solid ${thumbColorHex}`
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: thumbColorHex }} />
      </div>
    </div>
  );
}
