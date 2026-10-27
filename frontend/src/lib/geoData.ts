// 64 Districts of Bangladesh with their Thanas / Upazilas

export interface DistrictData {
  name: string;
  isDhaka: boolean;
  thanas: string[];
}

export const BANGLADESH_DISTRICTS: Record<string, DistrictData> = {
  // Dhaka Division
  'Dhaka': {
    name: 'Dhaka',
    isDhaka: true,
    thanas: [
      'Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mohammadpur',
      'Motijheel', 'Badda', 'Khilgaon', 'Jatrabari', 'Tejgaon', 'Rampura',
      'Old Dhaka', 'Savar', 'Dhamrai', 'Keraniganj', 'Other'
    ]
  },
  'Gazipur': {
    name: 'Gazipur',
    isDhaka: false,
    thanas: ['Gazipur Sadar', 'Tongi', 'Joydebpur', 'Kaliakair', 'Sreepur', 'Kapasia', 'Kaliganj', 'Other']
  },
  'Narayanganj': {
    name: 'Narayanganj',
    isDhaka: false,
    thanas: ['Narayanganj Sadar', 'Fatullah', 'Siddhirganj', 'Bandar', 'Rupganj', 'Araihazar', 'Sonargaon', 'Other']
  },
  'Tangail': {
    name: 'Tangail',
    isDhaka: false,
    thanas: ['Tangail Sadar', 'Mirzapur', 'Madhupur', 'Ghatail', 'Gopalpur', 'Sakhipur', 'Kalihati', 'Delduar', 'Nagarpur', 'Bhuapur', 'Other']
  },
  'Faridpur': {
    name: 'Faridpur',
    isDhaka: false,
    thanas: ['Faridpur Sadar', 'Boalmari', 'Bhanga', 'Nagarkanda', 'Madhukhali', 'Sadarpur', 'Other']
  },
  'Gopalganj': {
    name: 'Gopalganj',
    isDhaka: false,
    thanas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara', 'Other']
  },
  'Kishoreganj': {
    name: 'Kishoreganj',
    isDhaka: false,
    thanas: ['Kishoreganj Sadar', 'Bajitpur', 'Bhairab', 'Hossainpur', 'Karimganj', 'Katiadi', 'Kuliarchar', 'Pakundia', 'Other']
  },
  'Madaripur': {
    name: 'Madaripur',
    isDhaka: false,
    thanas: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar', 'Other']
  },
  'Manikganj': {
    name: 'Manikganj',
    isDhaka: false,
    thanas: ['Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Ghior', 'Daulatpur', 'Other']
  },
  'Munshiganj': {
    name: 'Munshiganj',
    isDhaka: false,
    thanas: ['Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Sirajdikhan', 'Sreenagar', 'Tongibari', 'Other']
  },
  'Narsingdi': {
    name: 'Narsingdi',
    isDhaka: false,
    thanas: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur', 'Other']
  },
  'Rajbari': {
    name: 'Rajbari',
    isDhaka: false,
    thanas: ['Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali', 'Other']
  },
  'Shariatpur': {
    name: 'Shariatpur',
    isDhaka: false,
    thanas: ['Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat', 'Naria', 'Zanjira', 'Other']
  },

  // Chittagong Division
  'Chittagong': {
    name: 'Chittagong',
    isDhaka: false,
    thanas: [
      'Agrabad', 'Nasirabad', 'GEC', 'Halishahar', 'Chawkbazar', 'Kotwali',
      'Panchlaish', 'Hathazari', 'Sitakunda', 'Mirsharai', 'Patiya', 'Boalkhali',
      'Anwara', 'Chandanaish', 'Fatikchhari', 'Raozan', 'Rangunia', 'Other']
  },
  "Cox's Bazar": {
    name: "Cox's Bazar",
    isDhaka: false,
    thanas: ["Cox's Bazar Sadar", 'Chakaria', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Kutubdia', 'Pekua', 'Other']
  },
  'Comilla': {
    name: 'Comilla',
    isDhaka: false,
    thanas: ['Comilla Sadar', 'Debidwar', 'Barura', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Laksam', 'Muradnagar', 'Nangalkot', 'Other']
  },
  'Feni': {
    name: 'Feni',
    isDhaka: false,
    thanas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonagazi', 'Fulgazi', 'Other']
  },
  'Brahmanbaria': {
    name: 'Brahmanbaria',
    isDhaka: false,
    thanas: ['Brahmanbaria Sadar', 'Ashuganj', 'Bancharampur', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail', 'Akhaura', 'Other']
  },
  'Chandpur': {
    name: 'Chandpur',
    isDhaka: false,
    thanas: ['Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj', 'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti', 'Other']
  },
  'Lakshmipur': {
    name: 'Lakshmipur',
    isDhaka: false,
    thanas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar', 'Other']
  },
  'Noakhali': {
    name: 'Noakhali',
    isDhaka: false,
    thanas: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj', 'Hatiya', 'Senbagh', 'Sonaimuri', 'Subarnachar', 'Other']
  },
  'Khagrachhari': {
    name: 'Khagrachhari',
    isDhaka: false,
    thanas: ['Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari', 'Mahalchhari', 'Manikchhari', 'Matiranga', 'Ramgarh', 'Other']
  },
  'Rangamati': {
    name: 'Rangamati',
    isDhaka: false,
    thanas: ['Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Kaptai', 'Kawkhali', 'Langadu', 'Naniarchar', 'Other']
  },
  'Bandarban': {
    name: 'Bandarban',
    isDhaka: false,
    thanas: ['Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari', 'Rowangchhari', 'Ruma', 'Thanchi', 'Other']
  },

  // Rajshahi Division
  'Rajshahi': {
    name: 'Rajshahi',
    isDhaka: false,
    thanas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore', 'Other']
  },
  'Bogra': {
    name: 'Bogra',
    isDhaka: false,
    thanas: ['Bogra Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatala', 'Other']
  },
  'Joypurhat': {
    name: 'Joypurhat',
    isDhaka: false,
    thanas: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi', 'Other']
  },
  'Naogaon': {
    name: 'Naogaon',
    isDhaka: false,
    thanas: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mohadevpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar', 'Other']
  },
  'Natore': {
    name: 'Natore',
    isDhaka: false,
    thanas: ['Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur', 'Lalpur', 'Singra', 'Naldanga', 'Other']
  },
  'Chapainawabganj': {
    name: 'Chapainawabganj',
    isDhaka: false,
    thanas: ['Nawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj', 'Other']
  },
  'Pabna': {
    name: 'Pabna',
    isDhaka: false,
    thanas: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar', 'Other']
  },
  'Sirajganj': {
    name: 'Sirajganj',
    isDhaka: false,
    thanas: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara', 'Other']
  },

  // Khulna Division
  'Khulna': {
    name: 'Khulna',
    isDhaka: false,
    thanas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Other']
  },
  'Bagerhat': {
    name: 'Bagerhat',
    isDhaka: false,
    thanas: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola', 'Other']
  },
  'Chuadanga': {
    name: 'Chuadanga',
    isDhaka: false,
    thanas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar', 'Other']
  },
  'Jessore': {
    name: 'Jessore',
    isDhaka: false,
    thanas: ['Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha', 'Other']
  },
  'Jhenaidah': {
    name: 'Jhenaidah',
    isDhaka: false,
    thanas: ['Jhenaidah Sadar', 'Harinakundu', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa', 'Other']
  },
  'Kushtia': {
    name: 'Kushtia',
    isDhaka: false,
    thanas: ['Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa', 'Kumarkhali', 'Mirpur', 'Other']
  },
  'Magura': {
    name: 'Magura',
    isDhaka: false,
    thanas: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur', 'Other']
  },
  'Meherpur': {
    name: 'Meherpur',
    isDhaka: false,
    thanas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar', 'Other']
  },
  'Narail': {
    name: 'Narail',
    isDhaka: false,
    thanas: ['Narail Sadar', 'Kalia', 'Lohagara', 'Other']
  },
  'Satkhira': {
    name: 'Satkhira',
    isDhaka: false,
    thanas: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala', 'Other']
  },

  // Barisal Division
  'Barisal': {
    name: 'Barisal',
    isDhaka: false,
    thanas: ['Barisal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi', 'Wazirpur', 'Other']
  },
  'Barguna': {
    name: 'Barguna',
    isDhaka: false,
    thanas: ['Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali', 'Other']
  },
  'Bhola': {
    name: 'Bhola',
    isDhaka: false,
    thanas: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin', 'Other']
  },
  'Jhalokati': {
    name: 'Jhalokati',
    isDhaka: false,
    thanas: ['Jhalokati Sadar', 'Kanthalia', 'Nalchity', 'Rajapur', 'Other']
  },
  'Patuakhali': {
    name: 'Patuakhali',
    isDhaka: false,
    thanas: ['Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki', 'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali', 'Other']
  },
  'Pirojpur': {
    name: 'Pirojpur',
    isDhaka: false,
    thanas: ['Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Indurkani', 'Other']
  },

  // Sylhet Division
  'Sylhet': {
    name: 'Sylhet',
    isDhaka: false,
    thanas: ['Sylhet Sadar', 'Balaganj', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'South Surma', 'Zakiganj', 'Other']
  },
  'Habiganj': {
    name: 'Habiganj',
    isDhaka: false,
    thanas: ['Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong', 'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj', 'Other']
  },
  'Moulvibazar': {
    name: 'Moulvibazar',
    isDhaka: false,
    thanas: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal', 'Other']
  },
  'Sunamganj': {
    name: 'Sunamganj',
    isDhaka: false,
    thanas: ['Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai', 'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Sullah', 'Tahirpur', 'Other']
  },

  // Rangpur Division
  'Rangpur': {
    name: 'Rangpur',
    isDhaka: false,
    thanas: ['Rangpur Sadar', 'Badarganj', 'Gangachhara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj', 'Other']
  },
  'Dinajpur': {
    name: 'Dinajpur',
    isDhaka: false,
    thanas: ['Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj', 'Chirirbandar', 'Phulbari', 'Ghoraghat', 'Hakimpur', 'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur', 'Other']
  },
  'Gaibandha': {
    name: 'Gaibandha',
    isDhaka: false,
    thanas: ['Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari', 'Sadullapur', 'Sughatta', 'Sundarganj', 'Other']
  },
  'Kurigram': {
    name: 'Kurigram',
    isDhaka: false,
    thanas: ['Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur', 'Chilmari', 'Nageshwari', 'Phulbari', 'Rajarhat', 'Raomari', 'Ulipur', 'Other']
  },
  'Lalmonirhat': {
    name: 'Lalmonirhat',
    isDhaka: false,
    thanas: ['Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram', 'Other']
  },
  'Nilphamari': {
    name: 'Nilphamari',
    isDhaka: false,
    thanas: ['Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka', 'Kishoreganj', 'Saidpur', 'Other']
  },
  'Panchagarh': {
    name: 'Panchagarh',
    isDhaka: false,
    thanas: ['Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia', 'Other']
  },
  'Thakurgaon': {
    name: 'Thakurgaon',
    isDhaka: false,
    thanas: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail', 'Other']
  },

  // Mymensingh Division
  'Mymensingh': {
    name: 'Mymensingh',
    isDhaka: false,
    thanas: ['Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj', 'Muktagachha', 'Nandail', 'Phulpur', 'Trishal', 'Other']
  },
  'Jamalpur': {
    name: 'Jamalpur',
    isDhaka: false,
    thanas: ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Islampur', 'Madarganj', 'Melandaha', 'Sarishabari', 'Other']
  },
  'Netrokona': {
    name: 'Netrokona',
    isDhaka: false,
    thanas: ['Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendua', 'Madan', 'Mohanganj', 'Purbadhala', 'Other']
  },
  'Sherpur': {
    name: 'Sherpur',
    isDhaka: false,
    thanas: ['Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi', 'Other']
  }
};

export const ALL_DISTRICT_NAMES = Object.keys(BANGLADESH_DISTRICTS).sort();
