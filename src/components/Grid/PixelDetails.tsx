import React from 'react';
import { ExternalLink, Clock, Wallet } from 'lucide-react';
import { Pixel } from '../../types/grid';

interface PixelDetailsProps {
  pixel: Pixel;
  onClose: () => void;
}

export const PixelDetails: React.FC<PixelDetailsProps> = ({ pixel, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-indigo-100 overflow-hidden">
      {pixel.image && (
        <div className="relative h-48 bg-gray-100">
          <img
            src={pixel.image}
            alt="Pixel content"
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Owned Pixel</h3>
            <p className="text-sm text-gray-500">
              Position: ({pixel.startX}, {pixel.startY})
              {(pixel.endX !== pixel.startX || pixel.endY !== pixel.startY) && 
                ` to (${pixel.endX}, ${pixel.endY})`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-1"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-indigo-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Owner</p>
              <p className="mt-1 font-mono text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">
                {pixel.owner}
              </p>
            </div>
          </div>

          {pixel.link && (
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-indigo-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Link</p>
                <a
                  href={pixel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1 break-all"
                >
                  {pixel.link}
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-500 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Purchase History</p>
              <div className="mt-2 space-y-2">
                {pixel.history.map((record, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === 0 ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {record.price.toFixed(3)} SOL
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-gray-600 break-all">
                      {record.owner}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};