import os
import sys
import src
import src.analyzer as analyzer
import argparse
from argparse import RawTextHelpFormatter
from itertools import zip_longest
from termcolor import colored
from src.db import SQLiteDatabase
from pydub import AudioSegment
import numpy as np

if __name__ == '__main__':
    db = SQLiteDatabase()

    parser = argparse.ArgumentParser(formatter_class=RawTextHelpFormatter)
    parser.add_argument('-f', '--file', required=True, help="Path to the MP3 file")
    args = parser.parse_args()

    file_path = args.file
    if not os.path.exists(file_path):
        print(colored("Error: File does not exist!", "red"))
        sys.exit(1)

    # Load MP3 and convert to raw audio
    audio = AudioSegment.from_file(file_path, format="mp3")
    audio = audio.set_channels(1).set_frame_rate(analyzer.DEFAULT_FS)
    samples = np.array(audio.get_array_of_samples(), dtype=np.int16)

    def grouper(iterable, n, fillvalue=None):
        args = [iter(iterable)] * n
        return (filter(None, values) for values in zip_longest(fillvalue=fillvalue, *args))

    def find_matches(samples, Fs=analyzer.DEFAULT_FS):
        hashes = analyzer.fingerprint(samples, Fs=Fs)
        return return_matches(hashes)

    def return_matches(hashes):
        mapper = {}
        for hash, offset in hashes:
            mapper[hash.upper()] = offset
        values = mapper.keys()

        for split_values in grouper(values, 1000):
            query = """
                SELECT upper(hash), song_fk, offset
                FROM fingerprints
                WHERE upper(hash) IN (%s)
            """
            vals = list(split_values).copy()
            length = len(vals)
            query = query % ', '.join('?' * length)
            x = db.executeAll(query, values=vals)
            matches_found = len(x)
            if matches_found > 0:
                msg = 'I found %d hash in db'
                print(colored(msg, 'green') % matches_found)

            for hash, sid, offset in x:
                yield (sid, mapper[hash])

    matches = list(find_matches(samples))

    def align_matches(matches):
        diff_counter = {}
        largest = 0
        largest_count = 0
        song_id = -1

        for sid, diff in matches:
            if diff not in diff_counter:
                diff_counter[diff] = {}

            if sid not in diff_counter[diff]:
                diff_counter[diff][sid] = 0

            diff_counter[diff][sid] += 1

            if diff_counter[diff][sid] > largest_count:
                largest = diff
                largest_count = diff_counter[diff][sid]
                song_id = sid

        songM = db.get_song_by_id(song_id)

        nseconds = round(float(largest) / analyzer.DEFAULT_FS * analyzer.DEFAULT_WINDOW_SIZE * analyzer.DEFAULT_OVERLAP_RATIO, 5)

        return {
            "SONG_ID": song_id,
            "SONG_NAME": songM[1],
            "CONFIDENCE": largest_count,
            "OFFSET": int(largest),
            "OFFSET_SECS": nseconds
        }

    total_matches_found = len(matches)

    if total_matches_found > 0:
        print(colored(f'Totally found {total_matches_found} hash', 'green'))
        song = align_matches(matches)
        print(colored(f' => song: {song["SONG_NAME"]} (id={song["SONG_ID"]})\n' 
                      f'    offset: {song["OFFSET"]} ({song["OFFSET_SECS"]} secs)\n', 'green'))
    else:
        print(colored('Not anything matching', 'red'))
