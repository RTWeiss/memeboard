import React from 'react';

const COLORS = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#FFA500', '#800080', '#008000', '#000080', '#800000', '#008080',
  '#FFC0CB', '#FFD700', '#FF4500', '#DA70D6', '#7B68EE', '#32CD32'
];

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-600">Select Color</label>
      <div className="grid grid-cols-6 gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
              selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
            }`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};