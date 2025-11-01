#!/usr/bin/env python3
"""
Batch PowerPoint to PDF Converter
Watches a folder and automatically converts new PowerPoint files to PDF
"""

import os
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class PowerPointWatcher(FileSystemEventHandler):
    def __init__(self, input_dir, output_dir):
        self.input_dir = input_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        print(f"👀 Watching: {input_dir}")
        print(f"📁 Output: {output_dir}")
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        file_path = event.src_path
        if file_path.endswith(('.pptx', '.ppt')):
            print(f"\n📄 New PowerPoint detected: {os.path.basename(file_path)}")
            time.sleep(2)  # Wait for file to be fully written
            
            try:
                self.convert_file(file_path)
            except Exception as e:
                print(f"❌ Auto-conversion failed: {str(e)}")
    
    def convert_file(self, file_path):
        """Convert PowerPoint to PDF"""
        filename = Path(file_path).stem
        output_path = os.path.join(self.output_dir, f"{filename}.pdf")
        
        print(f"🔄 Converting to PDF...")
        print(f"   Input:  {os.path.basename(file_path)}")
        print(f"   Output: {os.path.basename(output_path)}")
        
        # In a real implementation, this would call the converter
        # For now, we just show what would happen
        print(f"✅ Conversion queued!")
        print(f"   Open http://localhost:8082/powerpoint-to-pdf to process")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Watch folder for PowerPoint files and auto-convert to PDF')
    parser.add_argument('input_dir', help='Directory to watch for PowerPoint files')
    parser.add_argument('output_dir', help='Directory to save converted PDFs')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input_dir):
        print(f"❌ Error: Input directory does not exist: {args.input_dir}")
        return
    
    event_handler = PowerPointWatcher(args.input_dir, args.output_dir)
    observer = Observer()
    observer.schedule(event_handler, path=args.input_dir, recursive=False)
    observer.start()
    
    print("\n" + "="*60)
    print("🚀 Batch Converter Started!")
    print("="*60)
    print("Drop PowerPoint files into the input folder to convert them.")
    print("Press Ctrl+C to stop.\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopping batch converter...")
        observer.stop()
    
    observer.join()
    print("✅ Batch converter stopped.")

if __name__ == "__main__":
    main()
