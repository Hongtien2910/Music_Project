import sqlite3
import sys
from itertools import zip_longest
from termcolor import colored

class SQLiteDatabase():
  TABLE_SONGS = 'songs'
  TABLE_FINGERPRINTS = 'fingerprints'
  DB_FILE_NAME = 'db/music_db.db'

  def __init__(self):
    self.connect()

  def connect(self):
    """Kết nối đến SQLite database và thiết lập con trỏ."""
    self.conn = sqlite3.connect(self.DB_FILE_NAME)
    self.conn.text_factory = str
    self.cur = self.conn.cursor()
    
    self.cur.execute("CREATE INDEX IF NOT EXISTS idx_hash ON fingerprints(UPPER(hash))")
    self.conn.commit()

  def __del__(self):
    self.conn.commit() # Lưu lại các thay đổi trước khi đóng kết nối
    self.conn.close()

  def query(self, query, values = []):
    self.cur.execute(query, values)

  def executeOne(self, query, values = []):
    """Thực thi truy vấn SQL và trả về một kết quả duy nhất."""
    self.cur.execute(query, values)
    return self.cur.fetchone()

  def executeAll(self, query, values = []):
    """Thực thi truy vấn SQL và trả về tất cả kết quả tìm được."""
    self.cur.execute(query, values)
    return self.cur.fetchall()

  def buildSelectQuery(self, table, params):
    """Xây dựng truy vấn SELECT dựa trên các tham số đầu vào. """
    conditions = []
    values = []

    for k, v in enumerate(params):
      key = v
      value = params[v]
      conditions.append("%s = ?" % key)
      values.append(value)

    conditions = ' AND '.join(conditions)
    query = "SELECT * FROM %s WHERE %s" % (table, conditions)

    return {
      "query": query,
      "values": values
    }

  def findOne(self, params):
    select = self.buildSelectQuery(self.TABLE_SONGS, params)
    return self.executeOne(select['query'], select['values'])

  def findAll(self, table, params):
    select = self.buildSelectQuery(table, params)
    return self.executeAll(select['query'], select['values'])

  def insert(self, table, params):
    keys = ', '.join(params.keys())
    values = list(params.values())

    query = "INSERT INTO songs (%s) VALUES (?, ?)" % (keys)

    self.cur.execute(query, values)
    self.conn.commit()

    return self.cur.lastrowid

  def insertMany(self, table, columns, values):
    def grouper(iterable, n, fillvalue=None):
      """Chia danh sách giá trị thành các nhóm có kích thước n."""
      args = [iter(iterable)] * n
      return (filter(None, values) for values
          in zip_longest(fillvalue=fillvalue, *args))

    # Nhóm các giá trị thành từng nhóm nhỏ
    for split_values in grouper(values, 300):
      query = "INSERT OR IGNORE INTO %s (%s) VALUES (?, ?, ?)" % (table, ", ".join(columns))
      self.cur.executemany(query, split_values) # Chèn nhiều bản ghi cùng lúc

    self.conn.commit()

  """Lấy số lượng fingerprint của một bài hát dựa trên song_id."""
  def get_song_hashes_count(self, song_id):
    query = 'SELECT count(*) FROM %s WHERE song_fk = %d' % (self.TABLE_FINGERPRINTS, song_id)
    rows = self.executeOne(query)
    return int(rows[0])

  """Tìm bài hát dựa trên filehash."""
  def get_song_by_filehash(self, filehash):
    return self.findOne({
      "filehash": filehash
    })

  def add_song(self, filename, filehash):
    song = self.get_song_by_filehash(filehash)

    if not song:
      song_id = self.insert(self.TABLE_SONGS, {
        "name": filename,
        "filehash": filehash
      })
    else:
      song_id = song[0]

    return song_id

  """Lưu danh sách fingerprint vào bảng fingerprints."""
  def store_fingerprints(self, values):
    self.insertMany(self.TABLE_FINGERPRINTS,
      ['song_fk', 'hash', 'offset'], values
    )

  def get_song_by_id(self, id):
    return self.findOne({
      "id": id
    })