#!/usr/bin/env python3
"""批量处理所有 Pasted image 文件：重命名 + 更新文章引用"""
import os
import re
import glob

BASE_DIR = "/Users/lishutong/Documents/site/docs/notes/tech/rtos100"

# 收集所有需要处理的 md 文件
md_files = glob.glob(os.path.join(BASE_DIR, "*", "q*.md"))

total_renamed = 0
total_replaced = 0

for md_file in md_files:
    md_dir = os.path.dirname(md_file)
    rel_path = os.path.relpath(md_file, BASE_DIR)
    parts = rel_path.split(os.sep)
    group = parts[0]
    filename = parts[1]
    qnum = filename.replace(".md", "")  # q01
    
    # 对应的 images 目录
    images_dir = os.path.join(md_dir, "images", qnum)
    if not os.path.isdir(images_dir):
        continue
    
    # 找到 images 目录下所有 Pasted image 文件
    pasted_files = [f for f in os.listdir(images_dir) if f.startswith("Pasted image ")]
    if not pasted_files:
        continue
    
    # 按修改时间排序（或者按原文件名排序）
    pasted_files.sort()
    
    # 读取 md 文件内容
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 为每个 Pasted image 分配新名字
    rename_map = {}  # 旧文件名 -> 新文件名
    for i, old_name in enumerate(pasted_files, 1):
        # 提取时间戳部分，作为新名字的一部分
        # Pasted image 20261013121004.png -> p1.png
        ext = os.path.splitext(old_name)[1]
        new_name = f"p{i}{ext}"
        old_path = os.path.join(images_dir, old_name)
        new_path = os.path.join(images_dir, new_name)
        
        os.rename(old_path, new_path)
        rename_map[old_name] = new_name
        total_renamed += 1
        print(f"  RENAME: {group}/{qnum}/{old_name} -> {new_name}")
    
    # 更新 md 文件里的引用
    # 文章里的引用格式: ![](Pasted%20image%2020261013121004.png)
    # 需要替换成: ![](./images/qXX/p1.png)
    for old_name, new_name in rename_map.items():
        # URL 编码后的旧名字: Pasted%20image%2020261013121004.png
        old_encoded = old_name.replace(" ", "%20")
        
        # 匹配各种可能的引用格式
        # 1. ![](Pasted%20image%20xxx.png)
        # 2. ![alt](Pasted%20image%20xxx.png)
        pattern1 = r'!\[([^\]]*)\]\(' + re.escape(old_encoded) + r'\)'
        replacement1 = f'![{rename_map[old_name]}](./images/{qnum}/{new_name})'
        
        new_content = re.sub(pattern1, replacement1, content)
        if new_content != content:
            content = new_content
            total_replaced += 1
            print(f"  REPLACE: {group}/{qnum}.md -> {old_name} -> {new_name}")
    
    # 写回文件
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"\n=== 完成: 重命名了 {total_renamed} 个文件，替换了 {total_replaced} 处引用 ===")
