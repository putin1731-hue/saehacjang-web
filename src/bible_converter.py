import json
import os

# 1. 성경 권 순서 매핑 (행정부 지시: 01~66 인덱싱)
BIBLE_ORDER = {
    "Genesis": "01", "Exodus": "02", "Leviticus": "03", "Numbers": "04", "Deuteronomy": "05",
    # ... (중략) ... 
    "Matthew": "40", "Mark": "41", "Luke": "42", "John": "43", "Acts": "44",
    # ... (중략) ...
    "Revelation": "66"
}

# 2. 경로 설정 (src 폴더 내부 실행 대응)
input_file = 'korRV.json'
if not os.path.exists(input_file):
    input_file = '../korRV.json'

output_dir = '../data/bible'
os.makedirs(output_dir, exist_ok=True)

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 3. 변환 및 파일 생성 로직
for book in data['books']:
    book_name_en = book['name']
    book_id = BIBLE_ORDER.get(book_name_en, "00") # 순서 번호 추출
    prefix = book_name_en[:3].lower() 
    
    for ch in book['chapters']:
        chapter_num = int(ch['chapter'])
        
        # 행정부 지시 표준 파일명: {번호}_{약어}_{장}.json (예: 01_gen_01.json)
        file_id = f"{book_id}_{prefix}_{chapter_num:02d}"
        
        formatted_data = {
            "id": file_id,
            "book_id": int(book_id), # 운영 DB(PostgreSQL) 전환 대비 INT형 포함
            "book": book_name_en,
            "chapter": chapter_num,
            "verses": [
                {"v": v['verse'], "t": v['text'].strip()} 
                for v in ch['verses']
            ]
        }
        
        with open(os.path.join(output_dir, f"{file_id}.json"), 'w', encoding='utf-8') as out_f:
            json.dump(formatted_data, out_f, ensure_ascii=False, indent=2)

print(f"✅ [기술부] 성경 인덱싱 완료: {output_dir} 내 1,189개 파일 생성됨.")