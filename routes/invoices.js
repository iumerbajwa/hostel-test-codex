const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const buildPdfBuffer = (invoiceId) => {
  const content = `%PDF-1.3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(HFMS Invoice ${invoiceId}) Tj\nET\nBT\n/F1 12 Tf\n100 660 Td\n(Thank you for using HFMS.) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000256 00000 n \n0000000436 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n514\n%%EOF`;
  return Buffer.from(content, 'utf-8');
};

router.get('/:invoiceId', requireAuth, (req, res) => {
  const { invoiceId } = req.params;
  const buffer = buildPdfBuffer(invoiceId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${invoiceId}.pdf"`);
  res.send(buffer);
});

module.exports = router;
