import os
from docling.document_converter import DocumentConverter

def main():
    converter = DocumentConverter()
    
    # Path to your Data folder
# This finds the 'Data' folder regardless of where you run the script from
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "Data")
    output_dir = os.path.join(base_dir, "output_md")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    for filename in os.listdir(data_dir):
        if filename.endswith(".docx") or filename.endswith(".pdf"):
            print(f"Processing {filename}...")
            
            file_path = os.path.join(data_dir, filename)
            result = converter.convert(file_path)
            
            # Export to Markdown
            md_content = result.document.export_to_markdown()
            
            # Save the result
            output_name = filename.rsplit('.', 1)[0] + ".md"
            with open(os.path.join(output_dir, output_name), "w", encoding="utf-8") as f:
                f.write(md_content)
                
    print("\nAll files converted! Check the 'output_md' folder.")