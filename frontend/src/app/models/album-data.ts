import { Team, Sticker } from '../models/sticker.model';

// ─────────────────────────────────────────────
// FWC Section: 00 + FWC1-FWC19
// 00 = Panini Logo
// FWC1-FWC8 = Emblems / Host cities / Ball / Mascot / Slogan
// FWC9-FWC19 = World Cup History (11 stickers)
// ─────────────────────────────────────────────
export const FWC_STICKERS: Sticker[] = [
  { id: 'FWC00', name: 'Logo Panini', section: 'fwc', type: 'foil', albumOrder: 0 },
  { id: 'FWC01', name: 'Emblema Oficial 1/2', section: 'fwc', type: 'foil', albumOrder: 1 },
  { id: 'FWC02', name: 'Emblema Oficial 2/2', section: 'fwc', type: 'foil', albumOrder: 2 },
  { id: 'FWC03', name: 'Mascotas Oficiales', section: 'fwc', type: 'foil', albumOrder: 3 },
  { id: 'FWC04', name: 'Slogan Oficial', section: 'fwc', type: 'foil', albumOrder: 4 },
  { id: 'FWC05', name: 'Balón Oficial', section: 'fwc', type: 'foil', albumOrder: 5 },
  { id: 'FWC06', name: 'Canadá - Sede', section: 'fwc', type: 'foil', albumOrder: 6 },
  { id: 'FWC07', name: 'México - Sede', section: 'fwc', type: 'foil', albumOrder: 7 },
  { id: 'FWC08', name: 'USA - Sede', section: 'fwc', type: 'foil', albumOrder: 8 },
  { id: 'FWC09', name: 'Italia 1934 - Historia', section: 'fwc', type: 'history', albumOrder: 9 },
  { id: 'FWC10', name: 'Uruguay 1950 - Historia', section: 'fwc', type: 'history', albumOrder: 10 },
  { id: 'FWC11', name: 'Alemania Occ. 1954 - Historia', section: 'fwc', type: 'history', albumOrder: 11 },
  { id: 'FWC12', name: 'Brasil 1962 - Historia', section: 'fwc', type: 'history', albumOrder: 12 },
  { id: 'FWC13', name: 'Alemania Occ. 1974 - Historia', section: 'fwc', type: 'history', albumOrder: 13 },
  { id: 'FWC14', name: 'Argentina 1986 - Historia', section: 'fwc', type: 'history', albumOrder: 14 },
  { id: 'FWC15', name: 'Brasil 1994 - Historia', section: 'fwc', type: 'history', albumOrder: 15 },
  { id: 'FWC16', name: 'Brasil 2002 - Historia', section: 'fwc', type: 'history', albumOrder: 16 },
  { id: 'FWC17', name: 'Italia 2006 - Historia', section: 'fwc', type: 'history', albumOrder: 17 },
  { id: 'FWC18', name: 'Alemania 2014 - Historia', section: 'fwc', type: 'history', albumOrder: 18 },
  { id: 'FWC19', name: 'Argentina 2022 - Historia', section: 'fwc', type: 'history', albumOrder: 19 },
];

// ─────────────────────────────────────────────
// COCA-COLA STICKERS (14 total)
// ─────────────────────────────────────────────
export const COCA_STICKERS: Sticker[] = [
  { id: 'CC01', name: 'Lamine Yamal (España)', section: 'coca', type: 'special', albumOrder: 1 },
  { id: 'CC02', name: 'Lautaro Martínez (Argentina)', section: 'coca', type: 'special', albumOrder: 2 },
  { id: 'CC03', name: 'Harry Kane (Inglaterra)', section: 'coca', type: 'special', albumOrder: 3 },
  { id: 'CC04', name: 'Joshua Kimmich (Alemania)', section: 'coca', type: 'special', albumOrder: 4 },
  { id: 'CC05', name: 'Vinicius Jr. (Brasil)', section: 'coca', type: 'special', albumOrder: 5 },
  { id: 'CC06', name: 'Lionel Messi (Argentina)', section: 'coca', type: 'special', albumOrder: 6 },
  { id: 'CC07', name: 'Cristiano Ronaldo (Portugal)', section: 'coca', type: 'special', albumOrder: 7 },
  { id: 'CC08', name: 'Kylian Mbappé (Francia)', section: 'coca', type: 'special', albumOrder: 8 },
  { id: 'CC09', name: 'Erling Haaland (Noruega)', section: 'coca', type: 'special', albumOrder: 9 },
  { id: 'CC10', name: 'Pedri (España)', section: 'coca', type: 'special', albumOrder: 10 },
  { id: 'CC11', name: 'Jude Bellingham (Inglaterra)', section: 'coca', type: 'special', albumOrder: 11 },
  { id: 'CC12', name: 'Mohamed Salah (Egipto)', section: 'coca', type: 'special', albumOrder: 12 },
  { id: 'CC13', name: 'Eduardo Camavinga (Francia)', section: 'coca', type: 'special', albumOrder: 13 },
  { id: 'CC14', name: 'William Saliba (Francia)', section: 'coca', type: 'special', albumOrder: 14 },
];

// ─────────────────────────────────────────────
// TEAMS DATA (48 teams, 20 stickers each)
// Groups based on FIFA World Cup 2026 draw
// ─────────────────────────────────────────────
function buildTeam(
  code: string, name: string, flag: string, group: string,
  players: string[], teamPhotoPos: number = 13
): Team {
  const stickers: Sticker[] = [];
  // Sticker 1: Team Logo FOIL
  stickers.push({ id: `${code}1`, name: `Escudo - ${name}`, section: 'team', teamCode: code, teamName: name, type: 'foil', albumOrder: 1 });
  let playerIdx = 0;
  for (let i = 2; i <= 20; i++) {
    if (i === teamPhotoPos) {
      stickers.push({ id: `${code}${i}`, name: `Foto Equipo`, section: 'team', teamCode: code, teamName: name, type: 'normal', albumOrder: i });
    } else {
      stickers.push({ id: `${code}${i}`, name: players[playerIdx] || `Jugador ${playerIdx + 1}`, section: 'team', teamCode: code, teamName: name, type: 'normal', albumOrder: i });
      playerIdx++;
    }
  }
  return { code, name, flag, group, stickers };
}

export const TEAMS: Team[] = [
  buildTeam('CZE', 'Chequia', '🇨🇿', 'Grupo A', ['Matej Kovár','Jindrich Stanek','Ladislav Krejci','Vladimir Coufal','Jaroslav Zeleny','Tomas Holes','David Zima','Michal Sadilek','Lukas Provod','Lukas Cerv','Tomas Soucek','Pavel Sulc','Matej Vydra','Vasil Kusej','Tomas Chory','Vaclav Cerny','Adam Hlozek','Patrik Schick']),
  buildTeam('MEX', 'México', '🇲🇽', 'Grupo A', ['Luis Malagón','Johan Vásquez','Jorge Sánchez','César Montes','Jesús Gallardo','Israel Reyes','Diego Lainez','Carlos Rodríguez','Edson Álvarez','Orbelin Pineda','Marcel Ruiz','Érick Sánchez','Hirving Lozano','Santiago Giménez','Raúl Jiménez','Alexis Vega','Roberto Alvarado','César Huerta']),
  buildTeam('RSA', 'Sudáfrica', '🇿🇦', 'Grupo A', ['Ronwen Williams','Sipho Chaine','Aubrey Modiba','Samukele Kabini','Mbekezeli Mbokazi','Khulumani Ndamane','Siyabonga Ngezana','Khuliso Mudau','Nkosinathi Sibisi','Teboho Mokoena','Thalente Mbatha','Bathasi Aubaas','Yaya Sithole','Sipho Mbule','Lyle Foster','Iqraam Rayners','Mohau Nkota','Oswin Appollis']),
  buildTeam('KOR', 'Corea del Sur', '🇰🇷', 'Grupo A', ['Hyeon-woo Jo','Seung-Gyu Kim','Min-jae Kim','Yu-min Cho','Young-woo Seol','Han-beom Lee','Tae-seok Lee','Myung-jae Lee','Jae-sung Lee','In-beom Hwang','Kang-in Lee','Seung-ho Paik','Jens Castrop','Dong-yeong Lee','Gue-sung Cho','Heung-min Son','Hee-chan Hwang','Hyeon-Gyu Oh']),
  buildTeam('BIH', 'Bosnia y Herzegovina', '🇧🇦', 'Grupo B', ['Nikola Vasilj','Amer Dedic','Sead Kolasinac','Tarik Muharemovic','Nihad Mujakic','Nikola Katic','Amir Hadziahmetovic','Benjamin Tahirovic','Armin Gigovic','Ivan Sunjic','Ivan Basic','Dzenis Burnic','Esmir Bajraktarevic','Amar Memic','Ermedin Demirovic','Edin Dzeko','Samed Bazdar','Haris Tabakovic']),
  buildTeam('CAN', 'Canadá', '🇨🇦', 'Grupo B', ['Dayne St.Clair','Alphonso Davies','Alistair Johnston','Samuel Adekugbe','Richie Laryea','Derek Cornelius','Moïse Bombito','Kamal Miller','Stephen Eustáquio','Ismaël Koné','Jonathan Osorio','Jacob Shaffelburg','Mathieu Choinière','Niko Sigur','Tajon Buchanan','Liam Millar','Cyle Larin','Jonathan David']),
  buildTeam('QAT', 'Qatar', '🇶🇦', 'Grupo B', ['Meshaal Barsham','Sultan Albrake','Lucas Mendes','Homam Ahmed','Boualem Khoukhi','Pedro Miguel','Tarek Salman','Mohamed Al-Mannai','Karim Boudiaf','Assim Madibo','Ahmed Fatehi','Mohammed Waad','Abdulaziz Hatem','Hassan Al-Haydos','Edmilson Junior','Akram Hassan Afif','Ahmed Al Ganehi','Almoez Ali']),
  buildTeam('SUI', 'Suiza', '🇨🇭', 'Grupo B', ['Gregor Kobel','Yvon Mvogo','Manuel Akanji','Ricardo Rodríguez','Nico Elvedi','Aurèle Amenda','Silvan Widmer','Granit Xhaka','Denis Zakaria','Remo Freuler','Fabian Rieder','Ardon Jashari','Johan Manzambi','Michel Aebischer','Breel Embolo','Ruben Vargas','Dan Ndoye','Zeki Amdouni']),
  buildTeam('BRA', 'Brasil', '🇧🇷', 'Grupo C', ['Alisson','Bento','Marquinhos','Éder Militão','Gabriel Magalhães','Danilo','Wesley','Lucas Paquetá','Casemiro','Bruno Guimarães','Luiz Henrique','Vinicius Júnior','Rodrygo','João Pedro','Matheus Cunha','Gabriel Martinelli','Raphinha','Estévão']),
  buildTeam('HAI', 'Haití', '🇭🇹', 'Grupo C', ['Johny Placide','Carlens Arcus','Martin Expérience','Jean-Kevin Duverne','Ricardo Adé','Duke Lacroix','Garven Metusala','Hannes Delcroix','Leverton Pierre','Danley Jean Jacques','Jean-Ricner Bellegarde','Christopher Attys','Derrick Etienne Jr','Josué Casimir','Ruben Providence','Duckens Nazon','Louicius Deedson','Frantzdy Pierrot']),
  buildTeam('MAR', 'Marruecos', '🇲🇦', 'Grupo C', ['Yassine Bounou','Munir El Kajoui','Achraf Hakimi','Noussair Mazraoui','Nayef Aguerd','Roman Saiss','Jawad El Yamiq','Adam Masina','Sofyan Amrabat','Azzedine Ounahi','Eliesse Ben Seghir','Bilal El Khannouss','Ismael Saibari','Youssef En-Nesyri','Abde Ezzalzouli','Soufiane Rahimi','Brahim Díaz','Ayoub El Kaabi']),
  buildTeam('SCO', 'Escocia', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Grupo C', ['Angus Gunn','Jack Hendry','Kieran Tierney','Aaron Hickey','Andrew Robertson','Scott McKenna','John Souttar','Anthony Ralston','Grant Hanley','Scott McTominay','Billy Gilmour','Lewis Ferguson','Ryan Christie','Kenny McLean','John McGinn','Lyndon Dykes','Che Adams','Ben Doak']),
  buildTeam('AUS', 'Australia', '🇦🇺', 'Grupo D', ['Mathew Ryan','Joe Gauci','Harry Souttar','Alessandro Circati','Jordan Bos','Aziz Behich','Cameron Burgess','Lewis Miller','Milos Degenek','Jackson Irvine','Riley McGree','Aiden O\'Neill','Connor Metcalfe','Patrick Yazbek','Craig Goodwin','Kusini Yengi','Nestory Irankunda','Mohamed Touré']),
  buildTeam('PAR', 'Paraguay', '🇵🇾', 'Grupo D', ['Roberto Fernández','Orlando Gil','Gustavo Gómez','Fabián Balbuena','Juan José Cáceres','Omar Alderete','Junior Alonso','Mathías Villasanti','Diego Gómez','Damián Bobadilla','Andrés Cubas','Matías Galarza Fonda','Julio Enciso','Alejandro Romero Gamarra','Miguel Almirón','Ramón Sosa','Ángel Romero','Antonio Sanabria']),
  buildTeam('TUR', 'Türkiye', '🇹🇷', 'Grupo D', ['Uğurcan Çakır','Mert Müldür','Zeki Çelik','Abdülkerim Bardakçı','Çağlar Söyüncü','Merih Demiral','Ferdi Kadıoğlu','Kaan Ayhan','İsmail Yüksek','Hakan Çalhanoğlu','Orkun Kökçü','Arda Güler','İrfan Can Kahveci','Yunus Akgün','Can Uzun','Barış Alper Yılmaz','Kerem Aktürkoğlu','Kenan Yıldız']),
  buildTeam('USA', 'Estados Unidos', '🇺🇸', 'Grupo D', ['Matt Freese','Chris Richards','Tim Ream','Mark McKenzie','Alex Freeman','Antonee Robinson','Tyler Adams','Tanner Tessmann','Weston McKennie','Christian Roldán','Timothy Weah','Diego Luna','Malik Tillman','Christian Pulisic','Brenden Aaronson','Ricardo Pepi','Haji Wright','Folarin Balogun']),
  buildTeam('CUW', 'Curazao', '🇨🇼', 'Grupo E', ['Eloy Room','Armando Obispo','Sherel Floranus','Jurien Gaari','Joshua Brenet','Roshon Van Eijma','Shurandy Sambo','Livano Comenencia','Godfried Roemeratoe','Juninho Bacuna','Leandro Bacuna','Tahith Chong','Kenji Gorre','Jearl Margaritha','Jürgen Locadia','Jeremy Antonisse','Gervane Kastaneer','Sontje Hansen']),
  buildTeam('ECU', 'Ecuador', '🇪🇨', 'Grupo E', ['Hernán Galíndez','Gonzalo Valle','Piero Hincapié','Pervis Estupiñán','Willian Pacho','Ángelo Preciado','Joel Ordóñez','Moisés Caicedo','Alan Franco','Kendry Páez','Pedro Vite','John Yeboah','Leonardo Campana','Gonzalo Plata','Nilson Angulo','Alan Minda','Kevin Rodríguez','Enner Valencia']),
  buildTeam('GER', 'Alemania', '🇩🇪', 'Grupo E', ['Marc-André ter Stegen','Jonathan Tah','David Raum','Nico Schlotterbeck','Antonio Rüdiger','Waldemar Anton','Ridle Baku','Maximilian Mittelstädt','Joshua Kimmich','Florian Wirtz','Felix Nmecha','Leon Goretzka','Jamal Musiala','Serge Gnabry','Kai Havertz','Leroy Sané','Karim Adeyemi','Nick Woltemade']),
  buildTeam('CIV', 'Costa de Marfil', '🇨🇮', 'Grupo E', ['Yahia Fofana','Ghislain Konan','Wilfried Singo','Odilon Kossounou','Evan Ndicka','Willy Boly','Emmanuel Agbadou','Ousmane Diomandé','Franck Kessié','Séko Fofana','Ibrahim Sangaré','Jean-Philippe Gbamin','Amad Diallo','Sébastien Haller','Simon Adingra','Yan Diomandé','Evann Guessand','Oumar Diakité']),
  buildTeam('JPN', 'Japón', '🇯🇵', 'Grupo F', ['Zion Suzuki','Henry Heroki Mochizuki','Ayumu Seko','Junnosuke Suzuki','Shogo Taniguchi','Tsuyoshi Watanabe','Kaishu Sano','Yuki Soma','Ao Tanaka','Daichi Kamada','Takefusa Kubo','Ritsu Doan','Keito Nakamura','Takumi Minamino','Shuto Machino','Junya Ito','Koki Ogawa','Ayase Ueda']),
  buildTeam('NED', 'Países Bajos', '🇳🇱', 'Grupo F', ['Bart Verbruggen','Virgil van Dijk','Micky van de Ven','Jurriën Timber','Denzel Dumfries','Nathan Aké','Jeremie Frimpong','Jan Paul van Hecke','Tijjani Reijnders','Ryan Gravenberch','Teun Koopmeiners','Frenkie de Jong','Xavi Simons','Justin Kluivert','Memphis Depay','Donyell Malen','Wout Weghorst','Cody Gakpo']),
  buildTeam('SWE', 'Suecia', '🇸🇪', 'Grupo F', ['Victor Johansson','Isak Hien','Gabriel Gudmundsson','Emil Holm','Victor Nilsson Lindelöf','Gustaf Lagerbielke','Lucas Bergvall','Hugo Larsson','Jesper Karlström','Yasin Ayari','Mattias Svanberg','Daniel Svensson','Ken Sema','Roony Bardghji','Dejan Kulusevski','Anthony Elanga','Alexander Isak','Viktor Gyökeres']),
  buildTeam('TUN', 'Túnez', '🇹🇳', 'Grupo F', ['Bechir Ben Said','Aymen Dahmen','Yan Valéry','Montassar Talbi','Yassine Meriah','Ali Abdi','Dylan Bronn','Ellyes Skhiri','Aissa Laidouni','Ferjani Sassi','Mohamed Ali Ben Romdhane','Hannibal Mejbri','Elias Achouri','Elias Saad','Hazem Mastouri','Ismael Gharbi','Sayfallah Ltaief','Naim Sliti']),
  buildTeam('BEL', 'Bélgica', '🇧🇪', 'Grupo G', ['Thibaut Courtois','Arthur Theate','Timothy Castagne','Zeno Debast','Brandon Mechele','Maxim De Cuyper','Thomas Meunier','Youri Tielemans','Amadou Onana','Nicolas Raskin','Alexis Saelemaekers','Hans Vanaken','Kevin De Bruyne','Jérémy Doku','Charles De Ketelaere','Leandro Trossard','Loïs Openda','Romelu Lukaku']),
  buildTeam('EGY', 'Egipto', '🇪🇬', 'Grupo G', ['Mohamed El Shenawy','Mohamed Hany','Mohamed Hamdy','Yasser Ibrahim','Khaled Sobhi','Ramy Rabia','Hossam Abdelmaguid','Ahmed Fatouh','Marwan Attia','Zizo','Hamdy Fathy','Mohamed Lasheen','Emam Ashour','Osama Faisal','Mohamed Salah','Mostafa Mohamed','Trezeguet','Omar Marmoush']),
  buildTeam('IRN', 'Irán', '🇮🇷', 'Grupo G', ['Alireza Beiranvand','Morteza Pouraliganji','Ehsan Hajsafi','Milad Mohammadi','Shojae Khalilzadeh','Ramin Rezaeian','Hossein Kanaani','Sadegh Moharrami','Saleh Hardani','Saeed Ezatolahi','Saman Ghoddos','Omid Noorafkan','Roozbeh Cheshmi','Mohammad Mohebi','Sardar Azmoun','Mehdi Taremi','Alireza Jahanbakhsh','Ali Gholizadeh']),
  buildTeam('NZL', 'Nueva Zelanda', '🇳🇿', 'Grupo G', ['Max Crocombe Payne','Alex Paulsen','Michael Boxall','Liberato Cacace','Tim Payne','Tyler Bindon','Francis de Vries','Finn Surman','Joe Bell','Sarpreet Singh','Ryan Thomas','Matthew Garbett','Marko Stamenić','Ben Old','Chris Wood','Elijah Just','Callum McCowatt','Kosta Barbarouses']),
  buildTeam('CPV', 'Cabo Verde', '🇨🇻', 'Grupo H', ['Vozinha','Logan Costa','Pico','Diney','Steven Moreira','Wagner Pina','Joao Paulo','Yannick Semedo','Kevin Pina','Patrick Andrade','Jamiro Monteiro','Deroy Duarte','Garry Rodrigues','Jovane Cabral','Ryan Mendes','Dailon Livramento','Willy Semedo','Bebé']),
  buildTeam('KSA', 'Arabia Saudita', '🇸🇦', 'Grupo H', ['Nawaf Alaqidi','Abdulrahman Al-Sanbi','Saud Abdulhamid','Nawaf Bouwashl','Jihad Thakri','Moteb Al-Harbi','Hassan Altambakti','Musab Aljuwayr','Ziyad Aljohani','Abdullah Alkhaibari','Nasser Aldawsari','Saleh Abu Alshamat','Marwan Alsahafi','Salem Aldawsari','Abdulrahman Al-Aboud','Feras Akbrikan','Saleh Alshehri','Abdullah Al-Hamdan']),
  buildTeam('ESP', 'España', '🇪🇸', 'Grupo H', ['Unai Simón','Robin Le Normand','Aymeric Laporte','Dean Huijsen','Pedro Porro','Dani Carvajal','Marc Cucurella','Martín Zubimendi','Rodri','Pedri','Fabián Ruiz','Mikel Merino','Lamine Yamal','Dani Olmo','Nico Williams','Ferran Torres','Álvaro Morata','Mikel Oyarzabal']),
  buildTeam('URU', 'Uruguay', '🇺🇾', 'Grupo H', ['Sergio Rochet','Santiago Mele','Ronald Araújo','José María Giménez','Sebastián Cáceres','Mathias Olivera','Gonzalo Carneiro','Damián Suárez','Federico Valverde','Rodrigo Bentancur','Matías Vecino','Agustín Canobbio','Facundo Pellistri','Maximiliano Araújo','Nicolás de la Cruz','Giorgian de Arrascaeta','Darwin Núñez','Luis Suárez']),
  buildTeam('FRA', 'Francia', '🇫🇷', 'Grupo I', ['Mike Maignan','Lucas Digne','William Saliba','Jules Koundé','Theo Hernández','Benjamin Pavard','Eduardo Camavinga','Aurélien Tchouaméni','Mattéo Guendouzi','Ousmane Dembélé','Antoine Griezmann','Randal Kolo Muani','Marcus Thuram','Moussa Diaby','Youssouf Fofana','Adrien Rabiot','Kylian Mbappé','Bradley Barcola']),
  buildTeam('IRQ', 'Irak', '🇮🇶', 'Grupo I', ['Jalal Hassan','Dhurgham Ismail','Ali Adnan','Saad Natiq','Rebin Sulaka','Mohanad Ali','Amjad Attwan','Karrar Mohammed','Bashar Resan','Aymen Hussein','Alaa Abbas','Hussein Ali','Mazin Mohammed','Ahmed Yasin','Mohannad Abdul-Rahman','Emad Mohammed','Ibrahim Bayesh','Aymen Hussain']),
  buildTeam('NOR', 'Noruega', '🇳🇴', 'Grupo I', ['Ørjan Nyland','Kristoffer Ajer','Leo Skiri Østigård','Andreas Hanche-Olsen','Birger Meling','Stian Gregersen','Fredrik Aursnes','Patrick Berg','Sander Berge','Martin Ødegaard','Fredrik Sjøstad Alvsvåg','Ole Sæter','Mohamed Elyounoussi','Antonio Nusa','Alexander Sørloth','Erling Braut Haaland','Jørgen Strand Larsen','Ola Aina']),
  buildTeam('SEN', 'Senegal', '🇸🇳', 'Grupo I', ['Édouard Mendy','Kalidou Koulibaly','Formose Mendy','Ismaïla Sarr','Nampalys Mendy','Pape Abou Cissé','Abdou Diallo','Cheikhou Kouyaté','Idrissa Gueye','Pathé Ciss','Krepin Diatta','Habib Diallo','Sadio Mané','Nicolas Jackson','Boulaye Dia','Lamine Camara','Iliman Ndiaye','Pape Gueye']),
  buildTeam('ALG', 'Argelia', '🇩🇿', 'Grupo J', ['Alexis Guendouz','Ramy Bensebaini','Youcef Atal','Rayan Aït-Nouri','Mohamed Amine Tougai','Aïssa Mandi','Ismael Bennacer','Houssem Aouar','Hicham Boudaoui','Ramiz Zerrouki','Nabil Bentaleb','Farés Chaibi','Riyad Mahrez','Said Benrhama','Islam Slimani','Andy Delort','Djamel Benlamri','Youcef Belaïli']),
  buildTeam('ARG', 'Argentina', '🇦🇷', 'Grupo J', ['Emiliano Martínez','Germán Pezzella','Nicolás Otamendi','Cristian Romero','Marcos Acuña','Gonzalo Montiel','Rodrigo De Paul','Leandro Paredes','Alexis Mac Allister','Giovani Lo Celso','Ángel Di María','Julián Álvarez','Paulo Dybala','Thiago Almada','Lautaro Martínez','Alejandro Garnacho','Lionel Messi','Enzo Fernández']),
  buildTeam('AUT', 'Austria', '🇦🇹', 'Grupo J', ['Patrick Pentz','Phillipp Lienhart','David Alaba','Stefan Posch','Maximilian Wöber','Gernot Trauner','Konrad Laimer','Nicolas Seiwald','Florian Grillitsch','Marcel Sabitzer','Valentino Lazaro','Christoph Baumgartner','Michael Gregoritsch','Marko Arnautović','Patrick Wimmer','Romano Schmid','Ercan Kara','Andreas Weimann']),
  buildTeam('JOR', 'Jordania', '🇯🇴', 'Grupo J', ['Yazeed Abulaila','Mahmoud Shalaldeh','Yazan Alnaimat','Baha Faisal','Bairam Bandar','Khaled Al-Zoubi','Musa Almais','Ahmad Ibrahim','Nizar Al-Rawi','Saleh Rateb','Yazan Al-Arab','Nidal Ibraheem','Mousa Al-Tamari','Ibrahim Al-Saify','Ahmad Hayel','Hamza Al-Dardour','Odai Al-Saify','Mahmoud Almardi']),
  buildTeam('COL', 'Colombia', '🇨🇴', 'Grupo K', ['Camilo Vargas','Carlos Cuesta','Davinson Sánchez','Stefan Medina','Daniel Muñoz','Jhon Lucumí','Mateus Uribe','Jefferson Lerma','Richard Ríos','Juan Cuadrado','Luis Díaz','Yerson Mosquera','Rafael Santos Borré','Jhon Jáder Durán','James Rodríguez','Jhon Córdoba','Alfredo Morelos','Falcao García']),
  buildTeam('COD', 'R.D. del Congo', '🇨🇩', 'Grupo K', ['Joris Kayembe','Marcel Tisserand','Samuel Bastien','Silas Wissa','Chancel Mbemba','Arthur Masuaku','Théo Bongonda','Yannick Bolasie','Cédric Bakambu','Neeskens Kebano','Dylan Batubinsika','Jordan Botaka','Merveille Bope','Gédéon Kalulu','Rachid Bourabia','Yoane Wissa','Dodi Lukébakio','Rominigue Kouamé']),
  buildTeam('POR', 'Portugal', '🇵🇹', 'Grupo K', ['Diogo Costa','Rui Patrício','Rúben Dias','Pepe','Nuno Mendes','João Cancelo','Raphaël Guerreiro','Danilo Pereira','Vitinha','João Neves','Bernardo Silva','Bruno Fernandes','Rafael Leão','Gonçalo Inácio','Pedro Neto','Francisco Conceição','Cristiano Ronaldo','Gonçalo Ramos']),
  buildTeam('UZB', 'Uzbekistán', '🇺🇿', 'Grupo K', ['Utkir Yusupov','Farrukh Sayfiev','Sherzod Nasrullaev','Umar Eshmurodov','Husniddin Aliqulov','Rustamjon Ashurmatov','Khojiakbar Alijonov','Abdukodir Khusanov','Odiljon Hamrobekov','Otabek Shukurov','Jamshid Iskanderov','Otabek Kholmatov','Eldor Shomurodov','Jaloliddin Masharipov','Dostonbek Khamdamov','Sardor Rashidov','Bobur Abdixoliqov','Umid Kholmurodov']),
  buildTeam('CRO', 'Croacia', '🇭🇷', 'Grupo L', ['Dominik Livaković','Duje Ćaleta-Car','Borna Sosa','Josip Šutalo','Joško Gvardiol','Josip Stanisić','Šime Vrsaljko','Luka Modrić','Mateo Kovačić','Marcelo Brozović','Lovro Majer','Martin Baturina','Ante Budimir','Bruno Petković','Andrej Kramarić','Luka Ivanušec','Ivan Perišić','Marko Livaja']),
  buildTeam('ENG', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Grupo L', ['Jordan Pickford','John Stones','Kyle Walker','Harry Maguire','Marc Guéhi','Trent Alexander-Arnold','Luke Shaw','Declan Rice','Conor Gallagher','Phil Foden','Bukayo Saka','Marcus Rashford','Raheem Sterling','Anthony Gordon','Jude Bellingham','Cole Palmer','Harry Kane','Ollie Watkins']),
  buildTeam('GHA', 'Ghana', '🇬🇭', 'Grupo L', ['Lawrence Ati-Zigi','Daniel Amartey','Alexander Djiku','Tariq Lamptey','Gideon Mensah','Jonathan Mensah','Abdul Fatawu','Salis Abdul Samed','André Ayew','Jordan Ayew','Mohammed Kudus','Thomas Partey','Inaki Williams','Antoine Semenyo','Joel Fameyeh','Elisha Owusu','Abdul Mumin','Alexander Tetteh']),
  buildTeam('PAN', 'Panamá', '🇵🇦', 'Grupo L', ['Luis Mejía','Harold Cummings','Fidel Escobar','José Luis Rodríguez','Éric Davis','Roderick Miller','César Yanis','Adalberto Carrasquilla','Cristian Martínez','Aníbal Godoy','Iván Anderson','Abdiel Ayarza','Édgar Yoel Bárcenas','Ismael Díaz','Rodolfo Pizarro','Freddy Gondola','Cecilio Waterman','Rolando Blackburn']),
];

export const TOTAL_STICKERS = 20 + FWC_STICKERS.length + COCA_STICKERS.length + TEAMS.length * 20;
// 48 teams × 20 = 960, + 20 FWC + 14 Coca = but album says 980 base + 14 coca