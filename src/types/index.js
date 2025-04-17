
// These are now just jsdoc comments for documentation instead of strict TypeScript types

/**
 * Weather data object
 * @typedef {Object} WeatherData
 * @property {string} city - City name
 * @property {number} temperature - Temperature in Celsius
 * @property {string} description - Weather description
 * @property {number} windSpeed - Wind speed in m/s
 * @property {string} windDirection - Wind direction as text
 * @property {number} humidity - Humidity percentage
 * @property {number} pressure - Pressure in mmHg
 * @property {number} visibility - Visibility in km
 * @property {string} icon - Icon code from weather API
 * @property {number} timestamp - Unix timestamp of last update
 */

/**
 * Drone template object
 * @typedef {Object} DroneTemplate
 * @property {string} id - Unique identifier
 * @property {string} name - Drone name
 * @property {string} model - Drone model
 * @property {Object} specifications - Drone specifications
 * @property {number} specifications.maxFlightTime - Maximum flight time in minutes
 * @property {number} specifications.maxSpeed - Maximum speed in km/h
 * @property {number} specifications.maxAltitude - Maximum altitude in meters
 * @property {number} specifications.maxRange - Maximum range in km
 * @property {number} specifications.weight - Weight in grams
 * @property {Object} specifications.dimensions - Drone dimensions
 * @property {number} specifications.dimensions.length - Length in cm
 * @property {number} specifications.dimensions.width - Width in cm
 * @property {number} specifications.dimensions.height - Height in cm
 * @property {Object} [specifications.camera] - Camera specifications if present
 * @property {string} specifications.camera.model - Camera model
 * @property {string} specifications.camera.resolution - Camera resolution
 * @property {string} specifications.batteryType - Battery type
 */

/**
 * Form item object
 * @typedef {Object} FormItem
 * @property {string} id - Unique identifier
 * @property {string} content - Item content
 * @property {boolean} isChecked - Whether the item is checked
 * @property {string} type - Item type ('checkbox', 'text', 'number', 'select')
 * @property {string[]} [options] - Options for select type
 * @property {string} [value] - Value for text and number fields
 * @property {FormItem[]} [children] - Child items
 */

/**
 * Form section object
 * @typedef {Object} FormSection
 * @property {string} id - Unique identifier
 * @property {string} title - Section title
 * @property {FormItem[]} items - Section items
 */

/**
 * Section template object
 * @typedef {Object} SectionTemplate
 * @property {string} id - Unique identifier
 * @property {string} title - Template title
 * @property {FormItem[]} items - Template items
 */

/**
 * Report template object
 * @typedef {Object} ReportTemplate
 * @property {string} id - Unique identifier
 * @property {string} name - Template name
 * @property {SectionTemplate[]} sections - Template sections
 * @property {string[]} droneTypes - Compatible drone models
 */

/**
 * Report object
 * @typedef {Object} Report
 * @property {string} id - Unique identifier
 * @property {string} name - Report name
 * @property {string} date - Report date (dd.mm.yyyy)
 * @property {number} timestamp - Unix timestamp for sorting
 * @property {WeatherData} weather - Weather data
 * @property {DroneTemplate} drone - Drone data
 * @property {FormSection[]} sections - Report sections
 * @property {string} [createdBy] - Report creator
 * @property {string} [notes] - Additional notes
 */

/**
 * Report filter object
 * @typedef {Object} ReportFilter
 * @property {string} [dateFrom] - Start date filter
 * @property {string} [dateTo] - End date filter
 * @property {string} [droneModel] - Drone model filter
 * @property {string} sortBy - Sort field ('date' or 'drone')
 * @property {string} sortOrder - Sort order ('asc' or 'desc')
 */

/**
 * Wizard step object
 * @typedef {Object} WizardStep
 * @property {string} id - Unique identifier
 * @property {string} title - Step title
 * @property {React.ReactNode} content - Step content
 * @property {string} target - CSS selector for target element
 */
