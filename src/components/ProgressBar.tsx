interface ProgressBarProps {
  progress: number;
  message?: string;
}

export const ProgressBar = ({ progress, message }: ProgressBarProps) => {
  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: '#1F2937' }}>
          {message || 'Processing...'}
        </span>
        <span className="text-sm font-bold" style={{ color: '#E62B1E' }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div 
        className="w-full h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: '#E5E7EB' }}
      >
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: '#E62B1E'
          }}
        />
      </div>
    </div>
  );
};
