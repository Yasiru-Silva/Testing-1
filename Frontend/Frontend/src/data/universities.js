export const universities = [
  {
    id: 1,
    name: "Chuvash State Pedagogical University",
    location: "Cheboksary, Russia",
    description: "A leading pedagogical university offering comprehensive programs...",
    website: "https://chgpu.edu.ru/", 
 
    programs: [ ],
    established: "1930",
    students: "15000+",
    rating: 4.5
  },
  {
    id: 2,
    name: "Samara National Research University",
    location: "Samara, Russia",
    description: "A prestigious national research university known for aerospace...",
    website: "https://ssau.ru/", 
   
    programs: [ ],
    established: "1918", 
    students: "20000+",
    rating: 4.7
  },
  {
    id: 3,
    name: "Yaroslavl State Technical University (YSTU)",
    location: "Yaroslavl, Russia",
    description: "A technical university specializing in engineering, architecture...",
    website: "https://www.ystu.ru/",

    programs: [ ],
    established: "1944",
    students: "12000+",
    rating: 4.3
  },
  {
    id: 4,
    name: "Chuvash State Agrarian University",
    location: "Cheboksary, Russia",
    description: "Specialized university focusing on agricultural sciences...",
    website: "http://www.agro.chuvash.ru/", 
    
    programs: [ ],
    established: "1931",
    students: "10000+",
    rating: 4.2
  },
  {
    id: 5,
    name: "Lobachevsky State University of Nizhny Novgorod (UNN)",
    location: "Nizhny Novgorod, Russia",
    description: "One of Russia's oldest and most prestigious universities...",
    website: "http://www.unn.ru/", 

    programs: [ ],
    established: "1916",
    students: "40000+",
    rating: 4.6
  },
  {
    id: 6,
    name: "Kazan Innovative University",
    location: "Kazan, Russia",
    description: "A modern university combining traditional education...",
    website: "https://ieml.ru/", 
    
    programs: [ ],
    established: "1994",
    students: "18000+",
    rating: 4.4
  }
];


export const getUniversityById = (id) => {
  return universities.find(uni => uni.id == id);
};

export const getProgramsByUniversity = (universityId) => {
  const university = getUniversityById(universityId);
  return university ? university.programs : [];
};