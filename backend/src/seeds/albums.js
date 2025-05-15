import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { config } from "dotenv";

config();

const seedDatabase = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);

		// Clear existing data
		await Album.deleteMany({});
		await Song.deleteMany({});

		// First, create all songs
		const createdSongs = await Song.insertMany([
			{
				title: "2002", 
				artist: "Anne Marie",
				imageUrl: "/cover-images/2002.jpg", 
				audioUrl: "/songs/2002.mp3", 
				lyricUrl: "/lyrics/2002.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 187
			},
			{
				title: "24K Magic", 
				artist: "Bruno Mars",
				imageUrl: "/cover-images/24K Magic.jpg", 
				audioUrl: "/songs/24K Magic.mp3", 
				lyricUrl: "/lyrics/24K Magic.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 226
			},
			{
				title: "34+35", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/34+35.jpg", 
				audioUrl: "/songs/34+35.mp3", 
				lyricUrl: "/lyrics/34+35.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 172
			},
			{
				title: "7 rings", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/7 rings.jpg", 
				audioUrl: "/songs/7 rings.mp3", 
				lyricUrl: "/lyrics/7 rings.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 178
			},
			{
				title: "Agora Hills", 
				artist: "Doja Cat",
				imageUrl: "/cover-images/Agora Hills.jpg", 
				audioUrl: "/songs/Agora Hills.mp3", 
				lyricUrl: "/lyrics/Agora Hills.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 265
			},
			{
				title: "Alone", 
				artist: "Alan Walker",
				imageUrl: "/cover-images/Alone.jpg", 
				audioUrl: "/songs/Alone.mp3", 
				lyricUrl: "/lyrics/Alone.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 160
			},
			{
				title: "Anaconda", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Anaconda.jpg", 
				audioUrl: "/songs/Anaconda.mp3", 
				lyricUrl: "/lyrics/Anaconda.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 260
			},
			{
				title: "Army of Me", 
				artist: "Bjork",
				imageUrl: "/cover-images/Army of Me.jpg", 
				audioUrl: "/songs/Army of Me.mp3", 
				lyricUrl: "/lyrics/Army of Me.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 266
			},
			{
				title: "As Long As You Love Me", 
				artist: "Justin Bieber",
				imageUrl: "/cover-images/As Long As You Love Me.jpg", 
				audioUrl: "/songs/As Long As You Love Me.mp3", 
				lyricUrl: "/lyrics/As Long As You Love Me.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 229
			},
			{
				title: "Attention", 
				artist: "Charlie Puth",
				imageUrl: "/cover-images/Attention.jpg", 
				audioUrl: "/songs/Attention.mp3", 
				lyricUrl: "/lyrics/Attention.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 211
			},
			{
				title: "Baby", 
				artist: "Justin Bieber",
				imageUrl: "/cover-images/Baby.jpg", 
				audioUrl: "/songs/Baby.mp3", 
				lyricUrl: "/lyrics/Baby.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 214
			},
			{
				title: "Bad Blood", 
				artist: "Taylor Swift",
				imageUrl: "/cover-images/Bad Blood.jpg", 
				audioUrl: "/songs/Bad Blood.mp3", 
				lyricUrl: "/lyrics/Bad Blood.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 211
			},
			{
				title: "Bad Liar", 
				artist: "Imagine Dragons",
				imageUrl: "/cover-images/Bad Liar.jpg", 
				audioUrl: "/songs/Bad Liar.mp3", 
				lyricUrl: "/lyrics/Bad Liar.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 259
			},
			{
				title: "Bang Bang", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/Bang Bang.jpg", 
				audioUrl: "/songs/Bang Bang.mp3", 
				lyricUrl: "/lyrics/Bang Bang.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 199
			},
			{
				title: "Barbie World", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Barbie World.jpg", 
				audioUrl: "/songs/Barbie World.mp3", 
				lyricUrl: "/lyrics/Barbie World.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 109
			},
			{
				title: "Beauty and a Beat", 
				artist: "Justin Bieber",
				imageUrl: "/cover-images/Beauty and a Beat.jpg", 
				audioUrl: "/songs/Beauty and a Beat.mp3", 
				lyricUrl: "/lyrics/Beauty and a Beat.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 227
			},
			{
				title: "Believer", 
				artist: "Imagine Dragons",
				imageUrl: "/cover-images/Believer.jpg", 
				audioUrl: "/songs/Believer.mp3", 
				lyricUrl: "/lyrics/Believer.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 204
			},
			{
				title: "Blank Space", 
				artist: "Taylor Swift",
				imageUrl: "/cover-images/Blank Space.jpg", 
				audioUrl: "/songs/Blank Space.mp3", 
				lyricUrl: "/lyrics/Blank Space.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 231
			},
			{
				title: "Butterfly Waltz", 
				artist: "Brian Crain",
				imageUrl: "/cover-images/Butterfly Waltz.jpg", 
				audioUrl: "/songs/Butterfly Waltz.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 213
			},
			{
				title: "Call me Maybe", 
				artist: "Carly Rae Jepsen",
				imageUrl: "/cover-images/Call me Maybe.jpg", 
				audioUrl: "/songs/Call me Maybe.mp3", 
				lyricUrl: "/lyrics/Call me Maybe.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 209
			},
			{
				title: "Calm Down", 
				artist: "Selena Gomez",
				imageUrl: "/cover-images/Calm Down.jpg", 
				audioUrl: "/songs/Calm Down.mp3", 
				lyricUrl: "/lyrics/Calm Down.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 239
			},
			{
				title: "Closer", 
				artist: "The Chainsmokers",
				imageUrl: "/cover-images/Closer.jpg", 
				audioUrl: "/songs/Closer.mp3", 
				lyricUrl: "/lyrics/Closer.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 245
			},
			{
				title: "Creepin", 
				artist: "The Weeknd",
				imageUrl: "/cover-images/Creepin.jpg", 
				audioUrl: "/songs/Creepin.mp3", 
				lyricUrl: "/lyrics/Creepin.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 219
			},
			{
				title: "Dark Horse", 
				artist: "Katy Perry",
				imageUrl: "/cover-images/Dark Horse.jpg", 
				audioUrl: "/songs/Dark Horse.mp3", 
				lyricUrl: "/lyrics/Dark Horse.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 213
			},
			{
				title: "Darkside", 
				artist: "Alan Walker",
				imageUrl: "/cover-images/Darkside.jpg", 
				audioUrl: "/songs/Darkside.mp3", 
				lyricUrl: "/lyrics/Darkside.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 211
			},
			{
				title: "Dearly Beloved", 
				artist: "Yoko Shimomura",
				imageUrl: "/cover-images/Dearly Beloved.jpg", 
				audioUrl: "/songs/Dearly Beloved.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 73
			},
			{
				title: "Diamonds", 
				artist: "Rihanna",
				imageUrl: "/cover-images/Diamonds.jpg", 
				audioUrl: "/songs/Diamonds.mp3", 
				lyricUrl: "/lyrics/Diamonds.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 225
			},
			{
				title: "Die For You", 
				artist: "The Weeknd",
				imageUrl: "/cover-images/Die For You.jpg", 
				audioUrl: "/songs/Die For You.mp3", 
				lyricUrl: "/lyrics/Die For You.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 258
			},
			{
				title: "Die With A Smile", 
				artist: "Lady Gaga",
				imageUrl: "/cover-images/Die With A Smile.jpg", 
				audioUrl: "/songs/Die With A Smile.mp3", 
				lyricUrl: "/lyrics/Die With A Smile.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 251
			},
			{
				title: "Enemy", 
				artist: "Imagine Dragons",
				imageUrl: "/cover-images/Enemy.jpg", 
				audioUrl: "/songs/Enemy.mp3", 
				lyricUrl: "/lyrics/Enemy.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 170
			},
			{
				title: "Everything In Its Right Place", 
				artist: "Radiohead",
				imageUrl: "/cover-images/Everything In Its Right Place.jpg", 
				audioUrl: "/songs/Everything In Its Right Place.mp3", 
				lyricUrl: "/lyrics/Everything In Its Right Place.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 251
			},
			{
				title: "Faded", 
				artist: "Alan Walker",
				imageUrl: "/cover-images/Faded.jpg", 
				audioUrl: "/songs/Faded.mp3", 
				lyricUrl: "/lyrics/Faded.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 212
			},
			{
				title: "Girls Like You", 
				artist: "Maroon 5",
				imageUrl: "/cover-images/Girls Like You.jpg", 
				audioUrl: "/songs/Girls Like You.mp3", 
				lyricUrl: "/lyrics/Girls Like You.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 235
			},
			{
				title: "Havana", 
				artist: "Camila Cabello",
				imageUrl: "/cover-images/Havana.jpg", 
				audioUrl: "/songs/Havana.mp3", 
				lyricUrl: "/lyrics/Havana.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 212
			},
			{
				title: "How Long", 
				artist: "Charlie Puth",
				imageUrl: "/cover-images/How Long.jpg", 
				audioUrl: "/songs/How Long.mp3", 
				lyricUrl: "/lyrics/How Long.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 198
			},
			{
				title: "I See Fire", 
				artist: "Ed Sheeran",
				imageUrl: "/cover-images/I See Fire.jpg", 
				audioUrl: "/songs/I See Fire.mp3", 
				lyricUrl: "/lyrics/I See Fire.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 298
			},
			{
				title: "It's My Life", 
				artist: "Bon Jovi",
				imageUrl: "/cover-images/It's My Life.jpg", 
				audioUrl: "/songs/It's My Life.mp3", 
				lyricUrl: "/lyrics/It's My Life.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 224
			},
			{
				title: "Kiss Me More", 
				artist: "Doja Cat",
				imageUrl: "/cover-images/Kiss Me More.jpg", 
				audioUrl: "/songs/Kiss Me More.mp3", 
				lyricUrl: "/lyrics/Kiss Me More.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 208
			},
			{
				title: "Knockin' On Heaven's Door", 
				artist: "Bob Dylan",
				imageUrl: "/cover-images/Knockin' On Heaven's Door.jpg", 
				audioUrl: "/songs/Knockin' On Heaven's Door.mp3", 
				lyricUrl: "/lyrics/Knockin' On Heaven's Door.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 151
			},
			{
				title: "Last Christmas", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/Last Christmas.jpg", 
				audioUrl: "/songs/Last Christmas.mp3", 
				lyricUrl: "/lyrics/Last Christmas.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 211
			},
			{
				title: "Levitating", 
				artist: "Dua Lipa",
				imageUrl: "/cover-images/Levitating.jpg", 
				audioUrl: "/songs/Levitating.mp3", 
				lyricUrl: "/lyrics/Levitating.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 203
			},
			{
				title: "Light Switch", 
				artist: "Charlie Puth",
				imageUrl: "/cover-images/Light Switch.jpg", 
				audioUrl: "/songs/Light Switch.mp3", 
				lyricUrl: "/lyrics/Light Switch.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 185
			},
			{
				title: "Blinding Lights", 
				artist: "The Weeknd",
				imageUrl: "/cover-images/Blinding Lights.jpg", 
				audioUrl: "/songs/Blinding Lights.mp3", 
				lyricUrl: "/lyrics/Blinding Lights.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 199
			},
			{
				title: "Look What You Made Me Do", 
				artist: "Taylor Swift",
				imageUrl: "/cover-images/Look What You Made Me Do.jpg", 
				audioUrl: "/songs/Look What You Made Me Do.mp3", 
				lyricUrl: "/lyrics/Look What You Made Me Do.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 211
			},
			{
				title: "Love You Like A Love Song", 
				artist: "Rihanna",
				imageUrl: "/cover-images/Love You Like A Love Song.jpg", 
				audioUrl: "/songs/Love You Like A Love Song.mp3", 
				lyricUrl: "/lyrics/Love You Like A Love Song.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 197
			},
			{
				title: "Marry You", 
				artist: "Bruno Mars",
				imageUrl: "/cover-images/Marry You.jpg", 
				audioUrl: "/songs/Marry You.mp3", 
				lyricUrl: "/lyrics/Marry You.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 228
			},
			{
				title: "Merry-Go-Round of Life", 
				artist: "Joe Hisaishi",
				imageUrl: "/cover-images/Merry-Go-Round of Life.jpg", 
				audioUrl: "/songs/Merry-Go-Round of Life.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 311
			},
			{
				title: "New Rules", 
				artist: "Dua Lipa",
				imageUrl: "/cover-images/New Rules.jpg", 
				audioUrl: "/songs/New Rules.mp3", 
				lyricUrl: "/lyrics/New Rules.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 212
			},
			{
				title: "Night Changes", 
				artist: "One Direction",
				imageUrl: "/cover-images/Night Changes.jpg", 
				audioUrl: "/songs/Night Changes.mp3", 
				lyricUrl: "/lyrics/Night Changes.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 225
			},
			{
				title: "Nuvole Bianche", 
				artist: "Ludovico Einaudi",
				imageUrl: "/cover-images/Nuvole Bianche.jpg", 
				audioUrl: "/songs/Nuvole Bianche.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 362
			},
			{
				title: "Oblivion", 
				artist: "Grimes",
				imageUrl: "/cover-images/Oblivion.jpg", 
				audioUrl: "/songs/Oblivion.mp3", 
				lyricUrl: "/lyrics/Oblivion.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 249
			},
			{
				title: "One Kiss", 
				artist: "Dua Lipa",
				imageUrl: "/cover-images/One Kiss.jpg", 
				audioUrl: "/songs/One Kiss.mp3", 
				lyricUrl: "/lyrics/One Kiss.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 214
			},
			{
				title: "One Last Time", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/One Last Time.jpg", 
				audioUrl: "/songs/One Last Time.mp3", 
				lyricUrl: "/lyrics/One Last Time.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 197
			},
			{
				title: "One More Night", 
				artist: "Maroon 5",
				imageUrl: "/cover-images/One More Night.jpg", 
				audioUrl: "/songs/One More Night.mp3", 
				lyricUrl: "/lyrics/One More Night.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 219
			},
			{
				title: "Payphone", 
				artist: "Maroon 5",
				imageUrl: "/cover-images/Payphone.jpg", 
				audioUrl: "/songs/Payphone.mp3", 
				lyricUrl: "/lyrics/Payphone.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 231
			},
			{
				title: "Perfect", 
				artist: "Ed Sheeran",
				imageUrl: "/cover-images/Perfect.jpg", 
				audioUrl: "/songs/Perfect.mp3", 
				lyricUrl: "/lyrics/Perfect.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 263
			},
			{
				title: "Pound the Alarm", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Pound the Alarm.jpg", 
				audioUrl: "/songs/Pound the Alarm.mp3", 
				lyricUrl: "/lyrics/Pound the Alarm.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 204
			},
			{
				title: "Rather Be", 
				artist: "Clean bandit",
				imageUrl: "/cover-images/Rather Be.jpg", 
				audioUrl: "/songs/Rather Be.mp3", 
				lyricUrl: "/lyrics/Rather Be.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 227
			},
			{
				title: "Reminder", 
				artist: "The Weeknd",
				imageUrl: "/cover-images/Reminder.jpg", 
				audioUrl: "/songs/Reminder.mp3", 
				lyricUrl: "/lyrics/Reminder.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 219
			},
			{
				title: "River Flows in You", 
				artist: "Yiruma",
				imageUrl: "/cover-images/River Flows in You.jpg", 
				audioUrl: "/songs/River Flows in You.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 213
			},
			{
				title: "Rockabye", 
				artist: "Clean bandit",
				imageUrl: "/cover-images/Rockabye.jpg", 
				audioUrl: "/songs/Rockabye.mp3", 
				lyricUrl: "/lyrics/Rockabye.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 249
			},
			{
				title: "Runaway", 
				artist: "Aurora",
				imageUrl: "/cover-images/Runaway.jpg", 
				audioUrl: "/songs/Runaway.mp3", 
				lyricUrl: "/lyrics/Runaway.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 249
			},
			{
				title: "Say So", 
				artist: "Doja Cat",
				imageUrl: "/cover-images/Say So.jpg", 
				audioUrl: "/songs/Say So.mp3", 
				lyricUrl: "/lyrics/Say So.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 234
			},
			{
				title: "Senorita", 
				artist: "Shawn Mendes",
				imageUrl: "/cover-images/Senorita.jpg", 
				audioUrl: "/songs/Senorita.mp3", 
				lyricUrl: "/lyrics/Senorita.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 191
			},
			{
				title: "Shake It Off", 
				artist: "Taylor Swift",
				imageUrl: "/cover-images/Shake It Off.jpg", 
				audioUrl: "/songs/Shake It Off.mp3", 
				lyricUrl: "/lyrics/Shake It Off.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 219
			},
			{
				title: "Shape of You", 
				artist: "Ed Sheeran",
				imageUrl: "/cover-images/Shape of You.jpg", 
				audioUrl: "/songs/Shape of You.mp3", 
				lyricUrl: "/lyrics/Shape of You.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 233
			},
			{
				title: "Side To Side", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/Side To Side.jpg", 
				audioUrl: "/songs/Side To Side.mp3", 
				lyricUrl: "/lyrics/Side To Side.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 226
			},
			{
				title: "Silk Road", 
				artist: "Kitaro",
				imageUrl: "/cover-images/Silk Road.jpg", 
				audioUrl: "/songs/Silk Road.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 469
			},
			{
				title: "Solo", 
				artist: "Clean bandit",
				imageUrl: "/cover-images/Solo.jpg", 
				audioUrl: "/songs/Solo.mp3", 
				lyricUrl: "/lyrics/Solo.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 221
			},
			{
				title: "Something Just Like This", 
				artist: "The Chainsmokers",
				imageUrl: "/cover-images/Something Just Like This.jpg", 
				audioUrl: "/songs/Something Just Like This.mp3", 
				lyricUrl: "/lyrics/Something Just Like This.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 247
			},
			{
				title: "Starboy", 
				artist: "The Weeknd",
				imageUrl: "/cover-images/Starboy.jpg", 
				audioUrl: "/songs/Starboy.mp3", 
				lyricUrl: "/lyrics/Starboy.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 227
			},
			{
				title: "Starships", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Starships.jpg", 
				audioUrl: "/songs/Starships.mp3", 
				lyricUrl: "/lyrics/Starships.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 210
			},
			{
				title: "Stay Justin", 
				artist: "The Kid LAROI",
				imageUrl: "/cover-images/Stay Justin.jpg", 
				audioUrl: "/songs/Stay Justin.mp3", 
				lyricUrl: "/lyrics/Stay Justin.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 262
			},
			{
				title: "Stay Zedd", 
				artist: "Zedd",
				imageUrl: "/cover-images/Stay Zedd.jpg", 
				audioUrl: "/songs/Stay Zedd.mp3", 
				lyricUrl: "/lyrics/Stay Zedd.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 212
			},
			{
				title: "Stay", 
				artist: "Rihanna",
				imageUrl: "/cover-images/Stay.jpg", 
				audioUrl: "/songs/Stay.mp3", 
				lyricUrl: "/lyrics/Stay.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 240
			},
			{
				title: "Stressed Out", 
				artist: "Twenty One Pilots",
				imageUrl: "/cover-images/Stressed Out.jpg", 
				audioUrl: "/songs/Stressed Out.mp3", 
				lyricUrl: "/lyrics/Stressed Out.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 201
			},
			{
				title: "Sugar", 
				artist: "Maroon 5",
				imageUrl: "/cover-images/Sugar.jpg", 
				audioUrl: "/songs/Sugar.mp3", 
				lyricUrl: "/lyrics/Sugar.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 235
			},
			{
				title: "Summer", 
				artist: "Joe Hisaishi",
				imageUrl: "/cover-images/Summer.jpg", 
				audioUrl: "/songs/Summer.mp3", 
				lyricUrl: "", 
				plays: Math.floor(Math.random() * 5000),
				duration: 242
			},
			{
				title: "Super Bass", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Super Bass.jpg", 
				audioUrl: "/songs/Super Bass.mp3", 
				lyricUrl: "/lyrics/Super Bass.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 200
			},
			{
				title: "Super Freaky Girl", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Super Freaky Girl.jpg", 
				audioUrl: "/songs/Super Freaky Girl.mp3", 
				lyricUrl: "/lyrics/Super Freaky Girl.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 170
			},
			{
				title: "Swalla", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/Swalla.jpg", 
				audioUrl: "/songs/Swalla.mp3", 
				lyricUrl: "/lyrics/Swalla.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 216
			},
			{
				title: "Symphony", 
				artist: "Clean bandit",
				imageUrl: "/cover-images/Symphony.jpg", 
				audioUrl: "/songs/Symphony.mp3", 
				lyricUrl: "/lyrics/Symphony.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 210
			},
			{
				title: "Thank u, next", 
				artist: "Ariana Grande",
				imageUrl: "/cover-images/Thank u, next.jpg", 
				audioUrl: "/songs/Thank u, next.mp3", 
				lyricUrl: "/lyrics/Thank u, next.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 207
			},
			{
				title: "That's what i like", 
				artist: "Bruno Mars",
				imageUrl: "/cover-images/That's what i like.jpg", 
				audioUrl: "/songs/That's what i like.mp3", 
				lyricUrl: "/lyrics/That's what i like.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 206
			},
			{
				title: "The Night Is Still Young", 
				artist: "Nicky Minaj",
				imageUrl: "/cover-images/The Night Is Still Young.jpg", 
				audioUrl: "/songs/The Night Is Still Young.mp3", 
				lyricUrl: "/lyrics/The Night Is Still Young.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 227
			},
			{
				title: "The Spectre", 
				artist: "Alan Walker",
				imageUrl: "/cover-images/The Spectre.jpg", 
				audioUrl: "/songs/The Spectre.mp3", 
				lyricUrl: "/lyrics/The Spectre.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 193
			},
			{
				title: "There's Nothing Holdin' Me Back", 
				artist: "Shawn Mendes",
				imageUrl: "/cover-images/There's Nothing Holdin' Me Back.jpg", 
				audioUrl: "/songs/There's Nothing Holdin' Me Back.mp3", 
				lyricUrl: "/lyrics/There's Nothing Holdin' Me Back.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 205
			},
			{
				title: "This Is What You Came For", 
				artist: "Rihanna",
				imageUrl: "/cover-images/This Is What You Came For.jpg", 
				audioUrl: "/songs/This Is What You Came For.mp3", 
				lyricUrl: "/lyrics/This Is What You Came For.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 221
			},
			{
				title: "Thunder", 
				artist: "Imagine Dragons",
				imageUrl: "/cover-images/Thunder.jpg", 
				audioUrl: "/songs/Thunder.mp3", 
				lyricUrl: "/lyrics/Thunder.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 183
			},
			{
				title: "Treasure", 
				artist: "Bruno Mars",
				imageUrl: "/cover-images/Treasure.jpg", 
				audioUrl: "/songs/Treasure.mp3", 
				lyricUrl: "/lyrics/Treasure.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 176
			},
			{
				title: "Umbrella", 
				artist: "Rihanna",
				imageUrl: "/cover-images/Umbrella.jpg", 
				audioUrl: "/songs/Umbrella.mp3", 
				lyricUrl: "/lyrics/Umbrella.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 276
			},
			{
				title: "Uptown Funk", 
				artist: "Bruno Mars",
				imageUrl: "/cover-images/Uptown Funk.jpg", 
				audioUrl: "/songs/Uptown Funk.mp3", 
				lyricUrl: "/lyrics/Uptown Funk.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 269
			},
			{
				title: "We Don't Talk Anymore", 
				artist: "Charlie Puth",
				imageUrl: "/cover-images/We Don't Talk Anymore.jpg", 
				audioUrl: "/songs/We Don't Talk Anymore.mp3", 
				lyricUrl: "/lyrics/We Don't Talk Anymore.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 217
			},
			{
				title: "We Found Love", 
				artist: "Rihanna",
				imageUrl: "/cover-images/We Found Love.jpg", 
				audioUrl: "/songs/We Found Love.mp3", 
				lyricUrl: "/lyrics/We Found Love.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 215
			},
			{
				title: "What Makes You Beautiful", 
				artist: "One Direction",
				imageUrl: "/cover-images/What Makes You Beautiful.jpg", 
				audioUrl: "/songs/What Makes You Beautiful.mp3", 
				lyricUrl: "/lyrics/What Makes You Beautiful.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 214
			},
			{
				title: "White Winter Hymnal", 
				artist: "Fleet Foxes",
				imageUrl: "/cover-images/White Winter Hymnal.jpg", 
				audioUrl: "/songs/White Winter Hymnal.mp3", 
				lyricUrl: "/lyrics/White Winter Hymnal.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 147
			},
			{
				title: "Without Me", 
				artist: "Halsey",
				imageUrl: "/cover-images/Without Me.jpg", 
				audioUrl: "/songs/Without Me.mp3", 
				lyricUrl: "/lyrics/Without Me.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 201
			},
			{
				title: "Woman", 
				artist: "Doja Cat",
				imageUrl: "/cover-images/Woman.jpg", 
				audioUrl: "/songs/Woman.mp3", 
				lyricUrl: "/lyrics/Woman.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 172
			},
			{
				title: "Work", 
				artist: "Rihanna",
				imageUrl: "/cover-images/Work.jpg", 
				audioUrl: "/songs/Work.mp3", 
				lyricUrl: "/lyrics/Work.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 219
			},
			{
				title: "Young and Beautiful", 
				artist: "Lana Del Rey",
				imageUrl: "/cover-images/Young and Beautiful.jpg", 
				audioUrl: "/songs/Young and Beautiful.mp3", 
				lyricUrl: "/lyrics/Young and Beautiful.lrc", 
				plays: Math.floor(Math.random() * 5000),
				duration: 236
			},
		]);

		// Create albums with references to song IDs
		const albums = [
			{
				title: "Alan Song",
				artist: "Alan Walker",
				imageUrl: "/albums/Alan Song.jpg",
				releaseYear: 2022,
				songs: [
					createdSongs.find(song => song.title === "Alone")._id,
					createdSongs.find(song => song.title === "Darkside")._id,
					createdSongs.find(song => song.title === "Faded")._id,
					createdSongs.find(song => song.title === "The Spectre")._id,
				],			
			},
			{
				title: "Ariana Song",
				artist: "Ariana Grande",
				imageUrl: "/albums/Ariana Song.jpg",
				releaseYear: 2022,
				songs: [
					createdSongs.find(song => song.title === "7 rings")._id,
					createdSongs.find(song => song.title === "34+35")._id,
					createdSongs.find(song => song.title === "Bang Bang")._id,
					createdSongs.find(song => song.title === "Last Christmas")._id,
					createdSongs.find(song => song.title === "One Last Time")._id,
					createdSongs.find(song => song.title === "Side To Side")._id,
					createdSongs.find(song => song.title === "Thank u, next")._id,
				],			
			},
			{
				title: "Anne playlist",
				artist: "Anne Marie",
				imageUrl: "/albums/Anne playlist.jpg",
				releaseYear: 2019,
				songs: [
					createdSongs.find(song => song.title === "2002")._id,
					createdSongs.find(song => song.title === "Silk Road")._id,
				],			
			},
			{
				title: "AURORA",
				artist: "Aurora",
				imageUrl: "/albums/AURORA.jpg",
				releaseYear: 2015,
				songs: [
					createdSongs.find(song => song.title === "Runaway")._id,
				],			
			},
			{
				title: "Bjork Army",
				artist: "Bjork",
				imageUrl: "/albums/Bjork Army.jpg",
				releaseYear: 2015,
				songs: [
					createdSongs.find(song => song.title === "Army of Me")._id,
				],			
			},		
			{
				title: "Bob Dylan Playlist",
				artist: "Bob Dylan",
				imageUrl: "/albums/Bob Dylan Playlist.jpg",
				releaseYear: 2021,
				songs: [
					createdSongs.find(song => song.title === "Knockin' On Heaven's Door")._id,
				],			
			},			
			{
				title: "Mix Song",
				artist: "Bon Jovi",
				imageUrl: "/albums/Mix Song.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "It's My Life")._id,
					createdSongs.find(song => song.title === "Butterfly Waltz")._id,
				],			
			},	
			{
				title: "Bruno 24K",
				artist: "Bruno Mars",
				imageUrl: "/albums/Bruno 24K.jpg",
				releaseYear: 2014,
				songs: [
					createdSongs.find(song => song.title === "24K Magic")._id,
					createdSongs.find(song => song.title === "Marry You")._id,
					createdSongs.find(song => song.title === "That's what i like")._id,
					createdSongs.find(song => song.title === "Treasure")._id,
					createdSongs.find(song => song.title === "Uptown Funk")._id,
				],			
			},	
			{
				title: "Camila Carly",
				artist: "Camila Cabello",
				imageUrl: "/albums/Camila Carly.jpg",
				releaseYear: 2016,
				songs: [
					createdSongs.find(song => song.title === "Havana")._id,
					createdSongs.find(song => song.title === "Call me Maybe")._id,
				],			
			},	
			{
				title: "How Long",
				artist: "Charlie Puth",
				imageUrl: "/albums/How Long.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Attention")._id,
					createdSongs.find(song => song.title === "How Long")._id,
					createdSongs.find(song => song.title === "Light Switch")._id,
					createdSongs.find(song => song.title === "We Don't Talk Anymore")._id,
				],			
			},	
			{
				title: "Clean Bandit Album",
				artist: "Clean Bandit",
				imageUrl: "/albums/Clean Bandit Album.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Rather Be")._id,
					createdSongs.find(song => song.title === "Rockabye")._id,
					createdSongs.find(song => song.title === "Solo")._id,
					createdSongs.find(song => song.title === "Symphony")._id,
				],			
			},	
			{
				title: "Doja Cat Say So",
				artist: "Doja Cat",
				imageUrl: "/albums/Doja Cat Say So.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Agora Hills")._id,
					createdSongs.find(song => song.title === "Kiss Me More")._id,
					createdSongs.find(song => song.title === "Say So")._id,
					createdSongs.find(song => song.title === "Woman")._id,
				],			
			},	
			{
				title: "Dua Lipa New Rules",
				artist: "Dua Lipa",
				imageUrl: "/albums/Dua Lipa New Rules.jpg",
				releaseYear: 2022,
				songs: [
					createdSongs.find(song => song.title === "Levitating")._id,
					createdSongs.find(song => song.title === "New Rules")._id,
					createdSongs.find(song => song.title === "One Kiss")._id,
				],			
			},	
			{
				title: "Ed Sheeran Song",
				artist: "Ed Sheeran",
				imageUrl: "/albums/Ed Sheeran Song.jpg",
				releaseYear: 2009,
				songs: [
					createdSongs.find(song => song.title === "I See Fire")._id,
					createdSongs.find(song => song.title === "Perfect")._id,
					createdSongs.find(song => song.title === "White Winter Hymnal")._id,
				],			
			},	
			{
				title: "Mixed",
				artist: "Grimes",
				imageUrl: "/albums/Mixed.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Oblivion")._id,
					createdSongs.find(song => song.title === "Without Me")._id,
					createdSongs.find(song => song.title === "White Winter Hymnal")._id,
				],			
			},	
			{
				title: "Rong do",
				artist: "Imagine Dragons",
				imageUrl: "/albums/Rong do.jpg",
				releaseYear: 2010,
				songs: [
					createdSongs.find(song => song.title === "Bad Liar")._id,
					createdSongs.find(song => song.title === "Believer")._id,
					createdSongs.find(song => song.title === "Thunder")._id,
					createdSongs.find(song => song.title === "Enemy")._id,
				],			
			},	
			{
				title: "Instru",
				artist: "Joe Hisaishi",
				imageUrl: "/albums/Instru.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Merry-Go-Round of Life")._id,
					createdSongs.find(song => song.title === "Summer")._id,
				],			
			},	
			{
				title: "Justin Boy",
				artist: "Justin Bieber",
				imageUrl: "/albums/Justin Boy.jpg",
				releaseYear: 2024,
				songs: [
					createdSongs.find(song => song.title === "As Long As You Love Me")._id,
					createdSongs.find(song => song.title === "Baby")._id,
					createdSongs.find(song => song.title === "Beauty and a Beat")._id,
					createdSongs.find(song => song.title === "Stay Justin")._id,
				],			
			},	
			{
				title: "Dark",
				artist: "Katy Perry",
				imageUrl: "/albums/Dark.jpg",
				releaseYear: 2023,
				songs: [
					createdSongs.find(song => song.title === "Dark Horse")._id,
					createdSongs.find(song => song.title === "Silk Road")._id,
				],			
			},	
			{
				title: "Girl dont lie",
				artist: "Maroon 5",
				imageUrl: "/albums/Girl dont lie.jpg",
				releaseYear: 2021,
				songs: [
					createdSongs.find(song => song.title === "Girls Like You")._id,
					createdSongs.find(song => song.title === "One More Night")._id,
					createdSongs.find(song => song.title === "Payphone")._id,
					createdSongs.find(song => song.title === "Sugar")._id,
				],			
			},	
			{
				title: "Nicki Albums",
				artist: "Nicki Minaj",
				imageUrl: "/albums/Nicki Albums.jpg",
				releaseYear: 2022,
				songs: [
					createdSongs.find(song => song.title === "Anaconda")._id,
					createdSongs.find(song => song.title === "Barbie World")._id,
					createdSongs.find(song => song.title === "Pound the Alarm")._id,
					createdSongs.find(song => song.title === "Starships")._id,
					createdSongs.find(song => song.title === "Super Bass")._id,
					createdSongs.find(song => song.title === "Super Freaky Girl")._id,
					createdSongs.find(song => song.title === "The Night Is Still Young")._id,
					createdSongs.find(song => song.title === "Swalla")._id,
				],			
			},	
			{
				title: "One Direction",
				artist: "One Direction",
				imageUrl: "/albums/One Direction.jpg",
				releaseYear: 2015,
				songs: [
					createdSongs.find(song => song.title === "Night Changes")._id,
					createdSongs.find(song => song.title === "What Makes You Beautiful")._id,
				],			
			},	
			{
				title: "Rihanna Work",
				artist: "Rihanna",
				imageUrl: "/albums/Rihanna Work.jpg",
				releaseYear: 2010,
				songs: [
					createdSongs.find(song => song.title === "Diamonds")._id,
					createdSongs.find(song => song.title === "Stay")._id,
					createdSongs.find(song => song.title === "This Is What You Came For")._id,
					createdSongs.find(song => song.title === "Umbrella")._id,
					createdSongs.find(song => song.title === "We Found Love")._id,
					createdSongs.find(song => song.title === "Work")._id,
				],			
			},	
			{
				title: "Taylor Swift Album",
				artist: "Taylor Swift",
				imageUrl: "/albums/Taylor Swift Album.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Bad Blood")._id,
					createdSongs.find(song => song.title === "Blank Space")._id,
					createdSongs.find(song => song.title === "Look What You Made Me Do")._id,
					createdSongs.find(song => song.title === "Shake It Off")._id,
				],			
			},	
			{
				title: "Anh Tuan Cui",
				artist: "The Weeknd",
				imageUrl: "/albums/Bob.jpg",
				releaseYear: 2012,
				songs: [
					createdSongs.find(song => song.title === "Blinding Lights")._id,
					createdSongs.find(song => song.title === "Die For You")._id,
					createdSongs.find(song => song.title === "Reminder")._id,
					createdSongs.find(song => song.title === "Starboy")._id,
				],			
			},			
		];

		// Insert all albums
		const createdAlbums = await Album.insertMany(albums);

		// Update songs with their album references
		for (let i = 0; i < createdAlbums.length; i++) {
			const album = createdAlbums[i];
			const albumSongs = albums[i].songs;

			await Song.updateMany({ _id: { $in: albumSongs } }, { albumId: album._id });
		}

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		mongoose.connection.close();
	}
};

seedDatabase();