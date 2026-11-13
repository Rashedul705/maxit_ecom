const fs = require('fs');

const sourceCats = JSON.parse(fs.readFileSync('techshop_categories_source.json', 'utf8'));

// Define mapping logic from TechShopBD category/sub to MaxiTShop category & subcategory
const mappingRules = {
  // 1. Instruments
  'instruments': {
    defaultCat: 'tools---hardware',
    defaultSub: 'digital-multimeter-clamp-meter',
    subs: {
      'signal-generator': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'signal-analyzer': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'analog-multimeter': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'load-tester': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'digital-oscilloscopes': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'digital-multimeters': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'calculator': { cat: 'tools---hardware', sub: 'screwdriver-wrench-sets' },
      'measurement': { cat: 'tools---hardware', sub: 'digital-multimeter-clamp-meter' },
      'power-supply': { cat: 'customized-circuit---pcb', sub: 'power-supply-boards' }
    }
  },
  // 2. Drone
  'drone': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'motion-pir-sensors',
    subs: {
      'semi-professional-drone': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' },
      'professional-drone': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' }
    }
  },
  // 3. Kits
  'kits': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'esp32-arduino-modules',
    subs: {
      'sensor-kits': { cat: 'modules-&-sensor', sub: 'temperature-humidity-sensors' },
      'robotic-kits': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' },
      'starter-kits': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'science-box': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'advanced-kits': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' }
    }
  },
  // 4. Maintenance Tools
  'maintenance-tools': {
    defaultCat: 'tools---hardware',
    defaultSub: 'screwdriver-wrench-sets',
    subs: {
      'tools': { cat: 'tools---hardware', sub: 'screwdriver-wrench-sets' }
    }
  },
  // 5. Home Automation
  'home-automation': {
    defaultCat: 'smart-home-iot',
    defaultSub: 'smart-wifi-switches',
    subs: {
      'rechargeable-fan': { cat: 'smart-home-iot', sub: 'remote-sensor-monitor' },
      'appliance': { cat: 'smart-home-iot', sub: 'smart-sensors-accessories' },
      'ips-ups-inverter': { cat: 'ups', sub: 'long-backup-home-ups' },
      'remote': { cat: 'smart-home-iot', sub: 'remote-sensor-monitor' },
      'timer': { cat: 'automation-process-cont.', sub: 'digital-timer-switch' },
      'security-system': { cat: 'smart-home-iot', sub: 'smart-sensors-accessories' },
      'automatic-light': { cat: 'smart-home-iot', sub: 'smart-wifi-switches' },
      'automatic-switch': { cat: 'smart-home-iot', sub: 'smart-wifi-switches' }
    }
  },
  // 6. 3D Printer & Accessories
  '3d-printer-accessories': {
    defaultCat: 'tools---hardware',
    defaultSub: 'spot-welding-machine-rods',
    subs: {
      '3d-printing-machines': { cat: 'tools---hardware', sub: 'spot-welding-machine-rods' },
      '3d-printer-filament': { cat: 'tools---hardware', sub: 'cutting-disc-abrasives' }
    }
  },
  // 7. Miscellaneous
  'miscellaneous': {
    defaultCat: 'electronics-parts',
    defaultSub: 'heat-sink-enclosure',
    subs: {
      'audio': { cat: 'smart-home-iot', sub: 'voice-control-devices' },
      'screw': { cat: 'tools---hardware', sub: 'fasteners-royal-bolts' },
      'magnet': { cat: 'electronics-parts', sub: 'heat-sink-enclosure' },
      'pump': { cat: 'solar-package', sub: 'solar-pump-package' },
      'solenoid': { cat: 'automation-process-cont.', sub: 'industrial-relays-contactors' }
    }
  },
  // 8. Microcontroller
  'microcontroller': {
    defaultCat: 'electronics-parts',
    defaultSub: 'microcontroller-ic',
    subs: {
      'arm-microcontroller': { cat: 'electronics-parts', sub: 'microcontroller-ic' },
      'data-converter': { cat: 'electronics-parts', sub: 'driver-ic-optocoupler' },
      'avr-programmer': { cat: 'electronics-parts', sub: 'microcontroller-ic' },
      'pic-programmer': { cat: 'electronics-parts', sub: 'microcontroller-ic' },
      'other-microcontrollers-accessories': { cat: 'electronics-parts', sub: 'microcontroller-ic' }
    }
  },
  // 9. ESP
  'esp': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'esp32-arduino-modules',
    subs: {
      'esp8266': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'esp32': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' }
    }
  },
  // 10. Arduino
  'arduino': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'esp32-arduino-modules',
    subs: {
      'arduino-shield': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'arduino-board': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' }
    }
  },
  // 11. Development Board
  'development-board': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'esp32-arduino-modules',
    subs: {
      'raspberry-pi-accessories': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'other-development-board': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'arm-development-board': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'fpga-development-board': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'avr-development-board': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' }
    }
  },
  // 12. Robotics
  'robotics': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'motion-pir-sensors',
    subs: {
      'propeller': { cat: 'tools---hardware', sub: 'cutting-disc-abrasives' },
      'controller': { cat: 'modules-&-sensor', sub: 'esp32-arduino-modules' },
      'actuator': { cat: 'automation-process-cont.', sub: 'variable-frequency-drive-vfd' },
      'robotics-sensor': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' },
      'motor-driver': { cat: 'electronics-parts', sub: 'driver-ic-optocoupler' }
    }
  },
  // 13. Sensor
  'sensor': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'temperature-humidity-sensors',
    subs: {
      'sound': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' },
      'motion': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' },
      'weight': { cat: 'modules-&-sensor', sub: 'temperature-humidity-sensors' },
      'water': { cat: 'modules-&-sensor', sub: 'water-level-sensors' },
      'pressure': { cat: 'modules-&-sensor', sub: 'temperature-humidity-sensors' }
    }
  },
  // 14. Wireless Transceiver
  'wireless-transceiver': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'gps-rtc-modules',
    subs: {
      'xbee-zigbee': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'bluetooth': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'wifi': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'antennas': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'gsm-gps-gprs': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' }
    }
  },
  // 15. Accessories
  'accessories': {
    defaultCat: 'electronics-parts',
    defaultSub: 'heat-sink-enclosure',
    subs: {
      'computer-peripherals': { cat: 'office-equipment', sub: 'printer' },
      'cable': { cat: 'solar-energy', sub: 'solar-mounting-cables' },
      'connector': { cat: 'solar-energy', sub: 'solar-accessories-connectors' }
    }
  },
  // 16. Display
  'display': {
    defaultCat: 'modules-&-sensor',
    defaultSub: 'gps-rtc-modules',
    subs: {
      'display-driver': { cat: 'electronics-parts', sub: 'driver-ic-optocoupler' },
      'led-panel': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'multi-segment': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'dot-matrix': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'lcd-oled-e-ink': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' }
    }
  },
  // 17. Basic Component
  'basic-component': {
    defaultCat: 'electronics-parts',
    defaultSub: 'capacitor-resistor',
    subs: {
      'laser': { cat: 'modules-&-sensor', sub: 'motion-pir-sensors' },
      'inductor': { cat: 'electronics-parts', sub: 'capacitor-resistor' },
      'resistor': { cat: 'electronics-parts', sub: 'capacitor-resistor' },
      'capacitor': { cat: 'electronics-parts', sub: 'capacitor-resistor' },
      'led': { cat: 'igbt-fet-diode-transistor', sub: 'schottky-diode' }
    }
  },
  // 18. General IC
  'general-ic': {
    defaultCat: 'electronics-parts',
    defaultSub: 'power-management-ic',
    subs: {
      'rtc': { cat: 'modules-&-sensor', sub: 'gps-rtc-modules' },
      'driver': { cat: 'electronics-parts', sub: 'driver-ic-optocoupler' },
      'converter': { cat: 'electronics-parts', sub: 'power-management-ic' },
      '74-family': { cat: 'electronics-parts', sub: 'power-management-ic' },
      '4000-family': { cat: 'electronics-parts', sub: 'power-management-ic' }
    }
  },
  // 19. Computer & Accessories
  'computer-accessories': {
    defaultCat: 'office-equipment',
    defaultSub: 'projector',
    subs: {
      'projector': { cat: 'office-equipment', sub: 'projector' },
      'mini-pc': { cat: 'server-networking', sub: 'workstation' }
    }
  }
};

fs.writeFileSync('techshop_category_mapping.json', JSON.stringify(mappingRules, null, 2));
console.log('Successfully generated techshop_category_mapping.json');

