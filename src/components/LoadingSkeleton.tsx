'use client'
import { PERFORMANCE_CONFIG } from '../lib/performance-config'

interface LoadingSkeletonProps {
  type: 'specialties' | 'doctors'
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === 'specialties') {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PERFORMANCE_CONFIG.UI.SKELETON_ITEMS }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gray-200 p-3 rounded-full h-12 w-12"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'doctors') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: PERFORMANCE_CONFIG.UI.SKELETON_ITEMS }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gray-200 p-3 rounded-full h-12 w-12"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}