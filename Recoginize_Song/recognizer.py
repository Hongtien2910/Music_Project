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

def recognize(file_path):
    db = SQLiteDatabase()

    if not os.path.exists(file_path):
        raise FileNotFoundError("File does not exist!")

    audio = AudioSegment.from_file(file_path)
    audio = audio.set_channels(1).set_frame_rate(analyzer.DEFAULT_FS)
    samples = np.array(audio.get_array_of_samples(), dtype=np.int16)

    def grouper(iterable, n, fillvalue=None):
        args = [iter(iterable)] * n
        return (filter(None, values) for values in zip_longest(fillvalue=fillvalue, *args))

    def find_matches(samples, Fs=analyzer.DEFAULT_FS):
        hashes = analyzer.fingerprint(samples, Fs=Fs)
        return return_matches(hashes)

    def return_matches(hashes):
        mapper = {hash.upper(): offset for hash, offset in hashes}
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
            for hash, sid, offset in x:
                yield (sid, mapper[hash])

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

    matches = list(find_matches(samples))
    if matches:
        return align_matches(matches)
    else:
        return None
