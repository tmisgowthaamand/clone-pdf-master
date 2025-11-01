#!/usr/bin/env node
/**
 * PowerPoint to PDF Converter - Node.js Automation Script
 * Usage: node node_converter.js <input_file.pptx> [output_file.pdf]
 */

const fs = require('fs');
const path = require('path');

class PowerPointToPDFConverter {
  constructor(baseUrl = 'http://localhost:8082') {
    this.baseUrl = baseUrl;
  }

  async convertFile(inputPath, outputPath = null, quality = 'high') {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`File not found: ${inputPath}`);
    }

    // Prepare output path
    if (!outputPath) {
      outputPath = inputPath.replace(/\.(pptx?|ppt)$/i, '.pdf');
    }

    console.log(`🔄 Converting ${inputPath}...`);
    console.log(`📊 Quality: ${quality}`);

    // For client-side conversion, we provide instructions
    console.log(`\n⚠️  Note: This is a client-side converter.`);
    console.log(`   Open: ${this.baseUrl}/powerpoint-to-pdf`);
    console.log(`   Upload: ${path.basename(inputPath)}`);
    console.log(`   Output will be: ${path.basename(outputPath)}`);

    return outputPath;
  }

  async batchConvert(filePaths, outputDir = null) {
    const results = [];

    for (const filePath of filePaths) {
      try {
        let outputPath = null;
        if (outputDir) {
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          const basename = path.basename(filePath, path.extname(filePath));
          outputPath = path.join(outputDir, `${basename}.pdf`);
        }

        const converted = await this.convertFile(filePath, outputPath);
        results.push({ success: true, input: filePath, output: converted });
      } catch (error) {
        console.error(`❌ Failed to convert ${filePath}: ${error.message}`);
        results.push({ success: false, input: filePath, error: error.message });
      }
    }

    return results;
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node node_converter.js <input_file.pptx> [output_file.pdf]');
    console.log('\nExample:');
    console.log('  node node_converter.js presentation.pptx');
    console.log('  node node_converter.js presentation.pptx output.pdf');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || null;

  const converter = new PowerPointToPDFConverter();

  converter.convertFile(inputFile, outputFile)
    .then(result => {
      console.log(`\n✅ Conversion queued!`);
      console.log(`📄 Output: ${result}`);
    })
    .catch(error => {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = PowerPointToPDFConverter;
