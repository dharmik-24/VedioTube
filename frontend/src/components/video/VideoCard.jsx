import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatNumber } from '../../utils/helpers';

const VideoCard = ({ video }) => {
  if (!video) return null;

  return (
    <Link
      to={`/video/${video._id}`}
      className="group cursor-pointer hover:scale-105 transition-transform"
    >
      {/* Thumbnail */}
      <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-800">
        <img
          src={video.thumbnail?.url || 'https://via.placeholder.com/320x180'}
          alt={video.title}
          className="w-full h-44 object-cover group-hover:brightness-75 transition"
        />
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-xs rounded">
            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-accent transition">
          {video.title}
        </h3>

        {/* Channel */}
        <Link
          to={`/channel/${video.owner?.userName}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-gray-400 hover:text-white transition line-clamp-1"
        >
          {video.owner?.fullName}
        </Link>

        {/* Stats */}
        <p className="text-xs text-gray-500">
          {formatNumber(video.views)} views • {formatDate(video.createdAt)}
        </p>
      </div>
    </Link>
  );
};

export default VideoCard;
