#!/usr/bin/env python3
"""批量替换RTOS100问文章中的Obsidian图片引用为标准markdown格式"""
import os
import re
import glob

BASE_DIR = "/Users/lishutong/Documents/site/docs/notes/tech/rtos100"

count_files = 0
count_refs = [0]  # 用列表包装以便在闭包中修改

for md_file in glob.glob(os.path.join(BASE_DIR, "*", "q*.md")):
    # 从文件路径提取分组和问题编号
    # 如: .../rtos100/base/q01.md
    rel = os.path.relpath(md_file, BASE_DIR)
    parts = rel.split(os.sep)
    group = parts[0]
    filename = parts[1]
    qnum = filename.replace(".md", "")  # q01
    
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配 ![[xxx.drawio]] 或 ![[xxx.png]] 等 Obsidian 图片引用
    # 模式: ![[文件名.扩展名]]
    pattern = r'!\[\[([^\]]+)\]\]'
    
    def replace_ref(match):
        img_name = match.group(1)  # 如: 裸机主循环轮询流程图.drawio
        # 去掉扩展名，用.jpg
        name_without_ext = os.path.splitext(img_name)[0]
        # 构建新路径: ./images/q01/裸机主循环轮询流程图.jpg
        new_ref = f'![{name_without_ext}](./images/{qnum}/{name_without_ext}.jpg)'
        count_refs[0] += 1
        return new_ref
    
    new_content = re.sub(pattern, replace_ref, content)
    
    if new_content != content:
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count_files += 1
        print(f"OK: {rel}")

print(f"\n=== 完成: 修改了 {count_files} 个文件，替换了 {count_refs[0]} 处图片引用 ===")
