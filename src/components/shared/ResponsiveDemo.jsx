import { useResponsiveDesign } from '../../utils/appUtils'

const ResponsiveDemo = () => {
  const { deviceInfo, getResponsivePadding, getContainerMaxWidth, getTouchTargetSize, getResponsiveTextSize } = useResponsiveDesign()
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className={`font-semibold text-gray-900 mb-4 ${getResponsiveTextSize('lg')}`}>
        Responsive Design Demo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className={`font-medium text-blue-800 mb-2 ${getResponsiveTextSize('base')}`}>
            Device Information
          </h3>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span className="text-gray-600">Width:</span>
              <span className="font-medium">{deviceInfo.width}px</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Height:</span>
              <span className="font-medium">{deviceInfo.height}px</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Screen Size:</span>
              <span className="font-medium">{deviceInfo.screenSize}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Device Type:</span>
              <span className="font-medium">
                {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Orientation:</span>
              <span className="font-medium">{deviceInfo.orientation}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Touch Support:</span>
              <span className="font-medium">{deviceInfo.hasTouch ? 'Yes' : 'No'}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className={`font-medium text-green-800 mb-2 ${getResponsiveTextSize('base')}`}>
            Responsive Classes
          </h3>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span className="text-gray-600">Padding:</span>
              <span className="font-medium">{getResponsivePadding()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Container Width:</span>
              <span className="font-medium">{getContainerMaxWidth()}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Touch Targets:</span>
              <span className="font-medium">{getTouchTargetSize()}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className={`font-medium text-gray-800 mb-3 ${getResponsiveTextSize('base')}`}>
          Responsive Text Examples
        </h3>
        <div className="space-y-2">
          <p className={getResponsiveTextSize('xs')}>Extra Small Text</p>
          <p className={getResponsiveTextSize('sm')}>Small Text</p>
          <p className={getResponsiveTextSize('base')}>Base Text</p>
          <p className={getResponsiveTextSize('lg')}>Large Text</p>
          <p className={getResponsiveTextSize('xl')}>Extra Large Text</p>
        </div>
      </div>
      
      <div>
        <h3 className={`font-medium text-gray-800 mb-3 ${getResponsiveTextSize('base')}`}>
          Touch Targets Demo
        </h3>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <button
              key={item}
              className={`flex items-center justify-center bg-primary-500 text-white rounded-lg transition-all ${getTouchTargetSize()} ${getResponsiveTextSize('sm')}`}
            >
              Button {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ResponsiveDemo