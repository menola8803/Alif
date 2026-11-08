// The pictures on Today (Kaʿba, al-Masjid an-Nabawī, Hagia Sofia). One is picked at random each time Today is opened.
/* eslint-disable @typescript-eslint/no-var-requires */
export const HOME_IMAGES: number[] = [
  require('../assets/home/01.jpg'),
  require('../assets/home/02.jpg'),
  require('../assets/home/03.jpg'),
  require('../assets/home/04.jpg'),
  require('../assets/home/05.jpg'),
  require('../assets/home/06.jpg'),
  require('../assets/home/07.jpg'),
  require('../assets/home/08.jpg'),
  require('../assets/home/09.jpg'),
  require('../assets/home/10.jpg'),
  require('../assets/home/11.jpg'),
  require('../assets/home/12.jpg'),
  require('../assets/home/13.jpg'),
];
/** Where the main subject is in each picture, from the top (0) to the bottom (1); the visible strip is kept around it. */
export const HOME_FOCUS: number[] = [0.5, 0.55, 0.52, 0.45, 0.4, 0.38, 0.42, 0.6, 0.62, 0.5, 0.3, 0.32, 0.5];
