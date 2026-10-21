/**
 * Mock Database for maxitshop
 * Can be seamlessly replaced with MongoDB / Mongoose models via the services layer.
 */

const categories = [
  {
    "id": "cat-headphone-earphone",
    "name": "Headphone & Earphone",
    "slug": "headphone-earphone",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    "icon": "Headphones"
  },
  {
    "id": "cat-computer-office",
    "name": "Computer & Office",
    "slug": "computer-office",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    "icon": "Laptop"
  },
  {
    "id": "cat-office-supplies",
    "name": "Office Supplies",
    "slug": "office-Supplies",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80",
    "icon": "Briefcase"
  },
  {
    "id": "cat-solar-wind-energy",
    "name": "Solar and Wind Energy",
    "slug": "solar-wind-energy",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80",
    "icon": "Sun"
  },
  {
    "id": "cat-youtube-studio-gears",
    "name": "YouTube Studio Gears",
    "slug": "youtube-studio-gears",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80",
    "icon": "Video"
  },
  {
    "id": "cat-mobile-accessories",
    "name": "Mobile Accessories",
    "slug": "mobile-accessories",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80",
    "icon": "Smartphone"
  },
  {
    "id": "cat-watches-collection",
    "name": "Watches Collection",
    "slug": "watches-collection",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "icon": "Watch"
  },
  {
    "id": "cat-consumer-electronics",
    "name": "Consumer Electronics",
    "slug": "consumer-electronics",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80",
    "icon": "Tv"
  },
  {
    "id": "cat-health-fashion-grooming",
    "name": "Health, Fashion & Grooming",
    "slug": "health-fashion-grooming",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80",
    "icon": "Heart"
  },
  {
    "id": "cat-bags-accessories",
    "name": "Bags and Accessories",
    "slug": "Bags-Accessories",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    "icon": "ShoppingBag"
  },
  {
    "id": "cat-personal-care",
    "name": "Personal Care",
    "slug": "Personal-Care",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    "icon": "Sparkles"
  },
  {
    "id": "cat-kitchen-home-appliances",
    "name": "Kitchen and Home Appliances",
    "slug": "Kitchen-Home-Appliances",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&q=80",
    "icon": "Home"
  },
  {
    "id": "cat-keyboard-mouse",
    "name": "Keyboard & Mouse",
    "slug": "keyboard-mouse",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
    "icon": "Keyboard"
  },
  {
    "id": "cat-smart-home-iot",
    "name": "Smart Home iOT",
    "slug": "smart-home-iot",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    "icon": "Cpu"
  },
  {
    "id": "cat-all-products",
    "name": "All Products",
    "slug": "all-products",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80",
    "icon": "Layers"
  },
  {
    "id": "cat-adapter",
    "name": "Adapter",
    "slug": "adapter",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Zap"
  },
  {
    "id": "cat-arm-stand",
    "name": "Arm Stand",
    "slug": "arm-stand",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Maximize2"
  },
  {
    "id": "cat-card-reader",
    "name": "Card Reader",
    "slug": "card-reader",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "HardDrive"
  },
  {
    "id": "cat-electric-iron-steamer",
    "name": "Electric Iron & Steamer",
    "slug": "electric-iron--steamer",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Wind"
  },
  {
    "id": "cat-gamepad",
    "name": "Gamepad",
    "slug": "gamepad",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Gamepad2"
  },
  {
    "id": "cat-hair-dryer",
    "name": "Hair Dryer",
    "slug": "hair-dryer",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Flame"
  },
  {
    "id": "cat-hubs-docks",
    "name": "Hubs & Docks",
    "slug": "hubs--docks",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Server"
  },
  {
    "id": "cat-humidifier",
    "name": "Humidifier",
    "slug": "humidifier",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "CloudRain"
  },
  {
    "id": "cat-ips",
    "name": "IPS",
    "slug": "ips",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "BatteryCharging"
  },
  {
    "id": "cat-location-tracker",
    "name": "Location Tracker",
    "slug": "location-tracker",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Compass"
  },
  {
    "id": "cat-mixer",
    "name": "Mixer",
    "slug": "mixer",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Coffee"
  },
  {
    "id": "cat-monitor",
    "name": "Monitor",
    "slug": "monitor",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Monitor"
  },
  {
    "id": "cat-mousepad",
    "name": "Mousepad",
    "slug": "mousepad",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Square"
  },
  {
    "id": "cat-pc-cooler-and-fan",
    "name": "PC Cooler and Fan",
    "slug": "pc-cooler-and-fan",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Fan"
  },
  {
    "id": "cat-pendrive-flash-drive",
    "name": "Pendrive / Flash Drive",
    "slug": "pendrive--flash-drive",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Usb"
  },
  {
    "id": "cat-powerstrip",
    "name": "Powerstrip",
    "slug": "powerstrip",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Power"
  },
  {
    "id": "cat-presentation-clicker",
    "name": "Presentation Clicker",
    "slug": "presentation-clicker",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Pointer"
  },
  {
    "id": "cat-smart-ring",
    "name": "Smart Ring",
    "slug": "smart-ring",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "CircleDot"
  },
  {
    "id": "cat-summer-sale",
    "name": "Summer Sale",
    "slug": "summer-sale",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "SunMedium"
  },
  {
    "id": "cat-toy-car",
    "name": "Toy car",
    "slug": "toy-car",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Car"
  },
  {
    "id": "cat-ups-for-pc",
    "name": "UPS For PC",
    "slug": "ups-for-pc",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Shield"
  },
  {
    "id": "cat-deals-of-the-day",
    "name": "Deals of the Day",
    "slug": "deals-of-the-day",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Tag"
  },
  {
    "id": "cat-best-sellers",
    "name": "Best Sellers",
    "slug": "best-sellers",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=80",
    "icon": "Award"
  },
  {
    "id": "cat-solar",
    "name": "Solar & Green Energy",
    "slug": "solar-green-energy",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80",
    "icon": "Sun"
  },
  {
    "id": "cat-mobile",
    "name": "Mobile Phones",
    "slug": "mobile-phones",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    "icon": "Smartphone"
  },
  {
    "id": "cat-laptops",
    "name": "Laptops",
    "slug": "laptops",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    "icon": "Laptop"
  },
  {
    "id": "cat-watches",
    "name": "Smart Watches",
    "slug": "smart-watches",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "icon": "Watch"
  },
  {
    "id": "cat-home",
    "name": "Home Appliances",
    "slug": "home-appliances",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80",
    "icon": "Home"
  },
  {
    "id": "cat-accessories",
    "name": "Accessories",
    "slug": "accessories",
    "parent": null,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    "icon": "Headphones"
  },
  {
    "id": "sub-earbud-headphones",
    "name": "Earbud Headphones",
    "slug": "earbud-headphones",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-bluetooth-headphone",
    "name": "Bluetooth Headphone",
    "slug": "bluetooth-headphone",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-wired-headphones",
    "name": "Wired Headphones",
    "slug": "wired-headphones",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-gaming-headphone",
    "name": "Gaming Headphone",
    "slug": "gaming-headphone",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-over-ear-headphones",
    "name": "Over-Ear Headphones",
    "slug": "over-ear-headphones",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-in-ear-headphone",
    "name": "In-Ear Headphone",
    "slug": "in-ear-headphone",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-sports-headphone",
    "name": "Sports Headphone",
    "slug": "sports-headphone",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-headphone-stand",
    "name": "Headphone Stand",
    "slug": "headphone-stand",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-earphones",
    "name": "Earphones",
    "slug": "earphones",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-true-wireless-earbuds",
    "name": "True Wireless Earbuds",
    "slug": "true-wireless-earbuds",
    "parent": "headphone-earphone",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    "id": "sub-desk-lamp",
    "name": "Desk Lamp",
    "slug": "desk-lamp",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-mini-ups",
    "name": "Mini UPS",
    "slug": "mini-ups",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-pocket-router",
    "name": "Pocket Router",
    "slug": "pocket-router",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-thermal-printer",
    "name": "Thermal Printer",
    "slug": "thermal-printer",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-webcam",
    "name": "Webcam",
    "slug": "webcam",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-wifi-router",
    "name": "Wifi Router",
    "slug": "wifi-router",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-computer-networking",
    "name": "Computer Networking",
    "slug": "computer-networking",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-ssd-hdd",
    "name": "SSD & HDD",
    "slug": "ssd-hdd",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-computers",
    "name": "Computers",
    "slug": "computers",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-wifi-repeater",
    "name": "WiFi Repeater",
    "slug": "wifi-repeater",
    "parent": "computer-office",
    "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80"
  },
  {
    "id": "sub-calculator",
    "name": "Calculator",
    "slug": "calculator",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-circuit-breaker",
    "name": "Circuit Breaker",
    "slug": "circuit-breaker",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-ip-cameras",
    "name": "IP Cameras",
    "slug": "ip-cameras",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-projector",
    "name": "Projector",
    "slug": "projector",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-batteries",
    "name": "Batteries",
    "slug": "batteries",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-telephone-sets",
    "name": "Telephone Sets",
    "slug": "telephone-sets",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-attendance-machine",
    "name": "Attendance Machine",
    "slug": "attendance-machine",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-money-counting-machine",
    "name": "Money Counting Machine",
    "slug": "money-counting-machine",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-gaming-chair",
    "name": "Gaming Chair",
    "slug": "gaming-chair",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-scanner",
    "name": "Scanner",
    "slug": "scanner",
    "parent": "office-Supplies",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80"
  },
  {
    "id": "sub-energy-storage-management",
    "name": "Energy Storage Management",
    "slug": "Energy-Storage-Management",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-solar-accessories",
    "name": "Solar Accessories",
    "slug": "Solar-Accessories",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-solar-battery",
    "name": "Solar Batteries",
    "slug": "solar-battery",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-charge-controllers",
    "name": "Solar Charge Controllers",
    "slug": "charge-controllers",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-solar-inverter",
    "name": "Solar Inverters",
    "slug": "solar-inverter",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-solar-package",
    "name": "Solar Package",
    "slug": "solar-package",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-solar-panels",
    "name": "Solar Panels",
    "slug": "solar-panels",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-solar-station",
    "name": "Solar Power Station",
    "slug": "solar-station",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-wind-energy",
    "name": "Wind Energy",
    "slug": "Wind-Energy",
    "parent": "solar-wind-energy",
    "image": "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400&q=80"
  },
  {
    "id": "sub-microphone",
    "name": "Microphone",
    "slug": "microphone",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-ring-light",
    "name": "Ring Light",
    "slug": "ring-light",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-tripod-stand",
    "name": "Tripod & Stand",
    "slug": "tripod-stand",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-gimbal-collection",
    "name": "Gimbal Collection",
    "slug": "gimbal-collection",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-soft-box",
    "name": "Soft Box",
    "slug": "soft-box",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-led-video-light",
    "name": "Led Video Light",
    "slug": "led-video-light",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-youtube-accessories",
    "name": "YouTube Accessories",
    "slug": "youtube-accessories",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-studio-decoration",
    "name": "Studio Decoration",
    "slug": "studio-decoration",
    "parent": "youtube-studio-gears",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&q=80"
  },
  {
    "id": "sub-power-bank",
    "name": "Power Bank",
    "slug": "power-bank",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-cables-converters",
    "name": "Cables & Converters",
    "slug": "cables-converters",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-mobile-holder-mounts",
    "name": "Mobile Holder & Mounts",
    "slug": "mobile-holder-mounts",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-wall-charger",
    "name": "Wall Charger",
    "slug": "wall-charger",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-wireless-charger",
    "name": "Wireless Charger",
    "slug": "wireless-charger",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-car-charger",
    "name": "Car Charger",
    "slug": "car-charger",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-selfie-stick-monopods",
    "name": "Selfie Stick & Monopods",
    "slug": "selfie-stick-monopods",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-memory-cards",
    "name": "Memory Cards",
    "slug": "memory-cards",
    "parent": "mobile-accessories",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&q=80"
  },
  {
    "id": "sub-neckband",
    "name": "Neckband",
    "slug": "neckband",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-smartwatch",
    "name": "Smartwatch",
    "slug": "smartwatch",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-watch-strap",
    "name": "Watch Strap",
    "slug": "watch-strap",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-men-s-watches",
    "name": "Men&#039;s Watches",
    "slug": "men-s-watches",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-smart-band",
    "name": "Smart Band",
    "slug": "smart-band",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-ladies-watch",
    "name": "Ladies Watch",
    "slug": "ladies-watch",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-smart-watch",
    "name": "Smart Watch",
    "slug": "smart-watch",
    "parent": "watches-collection",
    "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    "id": "sub-video-camera",
    "name": "Video & Camera",
    "slug": "video-camera",
    "parent": "consumer-electronics",
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80"
  },
  {
    "id": "sub-gadget-shop",
    "name": "Gadget Shop",
    "slug": "gadget-shop",
    "parent": "consumer-electronics",
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80"
  },
  {
    "id": "sub-lights-lighting",
    "name": "Lights & Lighting",
    "slug": "lights-lighting",
    "parent": "consumer-electronics",
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80"
  },
  {
    "id": "sub-security-protection",
    "name": "Security & Protection",
    "slug": "security-protection",
    "parent": "consumer-electronics",
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80"
  },
  {
    "id": "sub-televisions-tv-boxes",
    "name": "Televisions & TV Boxes",
    "slug": "televisions-tv-boxes",
    "parent": "consumer-electronics",
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80"
  },
  {
    "id": "sub-others-electronics",
    "name": "Others Electronics",
    "slug": "others-electronics",
    "parent": "consumer-electronics",
    "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80"
  },
  {
    "id": "sub-health-protections",
    "name": "Health & Protections",
    "slug": "health-protections",
    "parent": "health-fashion-grooming",
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80"
  },
  {
    "id": "sub-trimmer-hair-care",
    "name": "Trimmer & Hair Care",
    "slug": "trimmer-hair-care",
    "parent": "health-fashion-grooming",
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80"
  },
  {
    "id": "sub-men-accessories",
    "name": "Men Accessories",
    "slug": "men-accessories",
    "parent": "health-fashion-grooming",
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80"
  },
  {
    "id": "sub-umbrella",
    "name": "Umbrella",
    "slug": "umbrella",
    "parent": "health-fashion-grooming",
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80"
  },
  {
    "id": "sub-fashion-accessories",
    "name": "Fashion Accessories",
    "slug": "fashion-accessories",
    "parent": "health-fashion-grooming",
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80"
  },
  {
    "id": "sub-dry-food-fruits",
    "name": "Dry Food & Fruits",
    "slug": "dry-food-fruits",
    "parent": "health-fashion-grooming",
    "image": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80"
  },
  {
    "id": "sub-backpacks",
    "name": "Backpacks",
    "slug": "backpacks",
    "parent": "Bags-Accessories",
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  },
  {
    "id": "sub-wallets",
    "name": "Wallets",
    "slug": "wallets",
    "parent": "Bags-Accessories",
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  },
  {
    "id": "sub-belts",
    "name": "Belts",
    "slug": "belts",
    "parent": "Bags-Accessories",
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  },
  {
    "id": "sub-travel-bags",
    "name": "Travel Bags",
    "slug": "travel-bags",
    "parent": "Bags-Accessories",
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  },
  {
    "id": "sub-leather-bags",
    "name": "Leather Bags",
    "slug": "leather-bags",
    "parent": "Bags-Accessories",
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80"
  },
  {
    "id": "sub-hair-clipper-trimmer",
    "name": "Hair Clipper & Trimmer",
    "slug": "hair-clipper-trimmer",
    "parent": "Personal-Care",
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"
  },
  {
    "id": "sub-electric-shaver",
    "name": "Electric Shaver",
    "slug": "electric-shaver",
    "parent": "Personal-Care",
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"
  },
  {
    "id": "sub-hair-straighteners",
    "name": "Hair Straighteners",
    "slug": "hair-straighteners",
    "parent": "Personal-Care",
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"
  },
  {
    "id": "sub-nose-trimmer",
    "name": "Nose Trimmer",
    "slug": "nose-trimmer",
    "parent": "Personal-Care",
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"
  },
  {
    "id": "sub-hair-removal-device",
    "name": "Hair Removal Device",
    "slug": "hair-removal-device",
    "parent": "Personal-Care",
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80"
  },
  {
    "id": "sub-electric-kettles",
    "name": "Electric Kettles",
    "slug": "Electric-Kettles",
    "parent": "Kitchen-Home-Appliances",
    "image": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&q=80"
  },
  {
    "id": "sub-juicers",
    "name": "Juicers",
    "slug": "Juicers",
    "parent": "Kitchen-Home-Appliances",
    "image": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&q=80"
  },
  {
    "id": "sub-microwaves",
    "name": "Microwaves",
    "slug": "Microwaves",
    "parent": "Kitchen-Home-Appliances",
    "image": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&q=80"
  },
  {
    "id": "sub-rechargeable-fan",
    "name": "Rechargeable Fan",
    "slug": "rechargeable-fan",
    "parent": "Kitchen-Home-Appliances",
    "image": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&q=80"
  },
  {
    "id": "sub-gaming-mouse",
    "name": "Gaming Mouse",
    "slug": "gaming-mouse",
    "parent": "keyboard-mouse",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80"
  },
  {
    "id": "sub-mechanical-keyboard",
    "name": "Mechanical Keyboard",
    "slug": "mechanical-keyboard",
    "parent": "keyboard-mouse",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80"
  },
  {
    "id": "sub-wireless-mouse",
    "name": "Wireless Mouse",
    "slug": "wireless-mouse",
    "parent": "keyboard-mouse",
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80"
  },
  {
    "id": "sub-smart-wifi-switches",
    "name": "Smart WiFi Switches",
    "slug": "smart-wifi-switches",
    "parent": "smart-home-iot",
    "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80"
  },
  {
    "id": "sub-voice-control-devices",
    "name": "Voice Control Devices",
    "slug": "voice-control-devices",
    "parent": "smart-home-iot",
    "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80"
  },
  {
    "id": "sub-remote-sensor-monitor",
    "name": "Remote & Sensor Monitor",
    "slug": "remote-sensor-monitor",
    "parent": "smart-home-iot",
    "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80"
  },
  {
    "id": "sub-audio-speaker",
    "name": "Audio & Speaker",
    "slug": "audio-speaker",
    "parent": "all-products",
    "image": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80"
  },
  {
    "id": "sub-solar-panels",
    "name": "Solar Panels",
    "slug": "solar-panels",
    "parent": "solar-green-energy",
    "image": "https://images.unsplash.com/photo-1508873696983-2df570464756?w=300&q=80"
  },
  {
    "id": "sub-solar-inverters",
    "name": "Inverters & Controllers",
    "slug": "inverters-controllers",
    "parent": "solar-green-energy",
    "image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&q=80"
  },
  {
    "id": "sub-solar-batteries",
    "name": "Solar Batteries",
    "slug": "solar-batteries",
    "parent": "solar-green-energy",
    "image": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=300&q=80"
  },
  {
    "id": "sub-solar-lights",
    "name": "Solar Street Lights",
    "slug": "solar-street-lights",
    "parent": "solar-green-energy",
    "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&q=80"
  },
  {
    "id": "sub-mob-smartphones",
    "name": "Smartphones",
    "slug": "smartphones",
    "parent": "mobile-phones",
    "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&q=80"
  },
  {
    "id": "sub-mob-tablets",
    "name": "Tablets & iPads",
    "slug": "tablets-ipads",
    "parent": "mobile-phones",
    "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80"
  },
  {
    "id": "sub-mob-feature",
    "name": "Feature Phones",
    "slug": "feature-phones",
    "parent": "mobile-phones",
    "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=300&q=80"
  },
  {
    "id": "sub-lap-gaming",
    "name": "Gaming Laptops",
    "slug": "gaming-laptops",
    "parent": "laptops",
    "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300&q=80"
  },
  {
    "id": "sub-lap-ultrabooks",
    "name": "Ultrabooks & Slim",
    "slug": "ultrabooks-slim",
    "parent": "laptops",
    "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80"
  },
  {
    "id": "sub-lap-business",
    "name": "Business Laptops",
    "slug": "business-laptops",
    "parent": "laptops",
    "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&q=80"
  },
  {
    "id": "sub-wat-fitness",
    "name": "Fitness Bands",
    "slug": "fitness-bands",
    "parent": "smart-watches",
    "image": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=300&q=80"
  },
  {
    "id": "sub-wat-calling",
    "name": "Calling Smartwatches",
    "slug": "calling-smartwatches",
    "parent": "smart-watches",
    "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&q=80"
  },
  {
    "id": "sub-home-cleaners",
    "name": "Robot Vacuums",
    "slug": "robot-vacuums",
    "parent": "home-appliances",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80"
  },
  {
    "id": "sub-home-kitchen",
    "name": "Air Fryers & Blenders",
    "slug": "kitchen-appliances",
    "parent": "home-appliances",
    "image": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=300&q=80"
  },
  {
    "id": "sub-acc-powerbanks",
    "name": "Power Banks",
    "slug": "power-banks",
    "parent": "accessories",
    "image": "https://images.unsplash.com/photo-1609592424364-7dfcf7ea8548?w=300&q=80"
  },
  {
    "id": "sub-acc-audio",
    "name": "TWS Earbuds",
    "slug": "tws-earbuds",
    "parent": "accessories",
    "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&q=80"
  },
  {
    "id": "sub-acc-chargers",
    "name": "Fast Chargers",
    "slug": "fast-chargers",
    "parent": "accessories",
    "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80"
  }
];

const banners = [
  {
    id: 'banner-1',
    title: 'Super Green Solar Power Solutions',
    subtitle: 'Save up to 70% on electricity bills with Tier-1 Mono PERC Panels',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1400&q=80',
    link: '/category/solar-green-energy',
    badge: 'Eco Energy Week'
  },
  {
    id: 'banner-2',
    title: 'Mega Gadget Festival 2026',
    subtitle: 'Official Flagship Phones, Laptops & Smartwatches with Brand Warranty',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&q=80',
    link: '/category/mobile-phones',
    badge: 'Cash on Delivery BD'
  },
  {
    id: 'banner-3',
    title: 'High Performance Gaming & Workstations',
    subtitle: 'RTX 40-Series Powered Laptops for Creators & Gamers',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1400&q=80',
    link: '/category/laptops',
    badge: 'Zero EMI Available'
  },
  {
    id: 'banner-4',
    title: 'Premium Audio & Smart Wearables',
    subtitle: 'Noise Cancelling Earbuds & AMOLED Smartwatches at Unbeatable Prices',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80',
    link: '/category/accessories',
    badge: 'Special Flash Sale'
  }
];

const products = require('./products.json');

// In-memory orders store
let orders = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-2026-1001',
    customerName: 'Tanvir Hossain',
    phone: '01712345678',
    address: 'House 42, Road 7, Block C, Dhanmondi',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Dhanmondi',
    items: [
      {
        id: 'prod-024',
        title: 'Kieslect Ks Pro Calling Smart Watch (2.01" AMOLED)',
        price: 6800,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80'
      }
    ],
    subtotal: 6800,
    deliveryCharge: 80,
    total: 6880,
    paymentMethod: 'cod',
    note: 'Please call before delivery',
    status: 'Processing', // Placed, Processing, Shipped, Delivered, Cancelled
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-2026-1002',
    customerName: 'Farhana Ahmed',
    phone: '01898765432',
    address: 'Agrabad C/A, Street 3',
    division: 'Chittagong',
    district: 'Chittagong',
    area: 'Agrabad',
    items: [
      {
        id: 'prod-037',
        title: 'UGREEN Nexode 65W GaN Fast Charger (3-Port)',
        price: 3200,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80'
      }
    ],
    subtotal: 6400,
    deliveryCharge: 130,
    total: 6530,
    paymentMethod: 'cod',
    note: 'Office address delivery between 10am-5pm',
    status: 'Shipped',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

module.exports = {
  categories,
  banners,
  products,
  orders
};
