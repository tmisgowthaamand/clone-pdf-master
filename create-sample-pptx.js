import PptxGenJS from 'pptxgenjs';

// Create a new presentation
const pptx = new PptxGenJS();

// Slide 1 - Title Slide
const slide1 = pptx.addSlide();
slide1.background = { color: '4472C4' };
slide1.addText('Sample PowerPoint Presentation', {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 1.5,
  fontSize: 44,
  bold: true,
  color: 'FFFFFF',
  align: 'center'
});
slide1.addText('Test File for PDF Conversion', {
  x: 0.5,
  y: 3.5,
  w: 9,
  h: 0.75,
  fontSize: 28,
  color: 'FFFFFF',
  align: 'center'
});

// Slide 2 - Content Slide with Text
const slide2 = pptx.addSlide();
slide2.background = { color: 'FFFFFF' };
slide2.addText('Features & Benefits', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.75,
  fontSize: 36,
  bold: true,
  color: '4472C4'
});
slide2.addText([
  { text: '• ', options: { fontSize: 24, color: '4472C4' } },
  { text: 'High Quality Conversion\n', options: { fontSize: 24, color: '000000' } },
  { text: '• ', options: { fontSize: 24, color: '4472C4' } },
  { text: 'Preserves Formatting\n', options: { fontSize: 24, color: '000000' } },
  { text: '• ', options: { fontSize: 24, color: '4472C4' } },
  { text: 'Maintains Images & Layouts\n', options: { fontSize: 24, color: '000000' } },
  { text: '• ', options: { fontSize: 24, color: '4472C4' } },
  { text: 'Fast & Reliable', options: { fontSize: 24, color: '000000' } }
], {
  x: 1,
  y: 1.5,
  w: 8,
  h: 3,
  lineSpacing: 32
});

// Slide 3 - Slide with Shapes
const slide3 = pptx.addSlide();
slide3.background = { color: 'F2F2F2' };
slide3.addText('Visual Elements', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.75,
  fontSize: 36,
  bold: true,
  color: '4472C4'
});

// Add shapes
slide3.addShape('rect', {
  x: 1,
  y: 2,
  w: 2,
  h: 1.5,
  fill: { color: 'ED7D31' }
});
slide3.addText('Box 1', {
  x: 1,
  y: 2.5,
  w: 2,
  h: 0.5,
  fontSize: 20,
  bold: true,
  color: 'FFFFFF',
  align: 'center'
});

slide3.addShape('rect', {
  x: 4,
  y: 2,
  w: 2,
  h: 1.5,
  fill: { color: '70AD47' }
});
slide3.addText('Box 2', {
  x: 4,
  y: 2.5,
  w: 2,
  h: 0.5,
  fontSize: 20,
  bold: true,
  color: 'FFFFFF',
  align: 'center'
});

slide3.addShape('rect', {
  x: 7,
  y: 2,
  w: 2,
  h: 1.5,
  fill: { color: '5B9BD5' }
});
slide3.addText('Box 3', {
  x: 7,
  y: 2.5,
  w: 2,
  h: 0.5,
  fontSize: 20,
  bold: true,
  color: 'FFFFFF',
  align: 'center'
});

// Slide 4 - Data Slide
const slide4 = pptx.addSlide();
slide4.background = { color: 'FFFFFF' };
slide4.addText('Sample Data', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.75,
  fontSize: 36,
  bold: true,
  color: '4472C4'
});

// Add a simple table
const rows = [
  ['Item', 'Q1', 'Q2', 'Q3', 'Q4'],
  ['Revenue', '$100K', '$120K', '$150K', '$180K'],
  ['Expenses', '$60K', '$70K', '$80K', '$90K'],
  ['Profit', '$40K', '$50K', '$70K', '$90K']
];

slide4.addTable(rows, {
  x: 1,
  y: 1.5,
  w: 8,
  h: 2.5,
  fontSize: 16,
  color: '000000',
  fill: { color: 'F2F2F2' },
  border: { pt: 1, color: '4472C4' },
  align: 'center',
  valign: 'middle'
});

// Slide 5 - Thank You Slide
const slide5 = pptx.addSlide();
slide5.background = { fill: '4472C4' };
slide5.addText('Thank You!', {
  x: 0.5,
  y: 2,
  w: 9,
  h: 1.5,
  fontSize: 48,
  bold: true,
  color: 'FFFFFF',
  align: 'center'
});
slide5.addText('This presentation was created for testing PDF conversion', {
  x: 0.5,
  y: 3.5,
  w: 9,
  h: 0.5,
  fontSize: 20,
  color: 'FFFFFF',
  align: 'center',
  italic: true
});

// Save the presentation
pptx.writeFile({ fileName: 'Sample-Presentation.pptx' })
  .then(() => {
    console.log('✅ Sample PowerPoint file created successfully!');
    console.log('📄 File: Sample-Presentation.pptx');
    console.log('📊 Slides: 5');
    console.log('🎨 Features: Text, Shapes, Tables, Colors, Formatting');
    console.log('\n👉 You can now upload this file to test the PDF conversion!');
  })
  .catch(err => {
    console.error('❌ Error creating PowerPoint file:', err);
  });
