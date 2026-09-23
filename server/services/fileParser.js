import * as xlsx from 'xlsx';

class FileParser {
  parse(buffer, filename) {
    let data = [];
    
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(sheet);
    } catch (e) {
      console.error('Error parsing file:', e);
      throw new Error('Failed to parse file. Please upload a valid CSV or Excel file.');
    }
    
    // Normalize keys (lowercase, trim) and detect common columns
    const normalizedData = data.map((row, index) => {
      const normalizedRow = { __original_index: index };
      for (const key in row) {
        const cleanKey = key.trim().toLowerCase();
        normalizedRow[cleanKey] = row[key];
        
        // Auto-detect aliases for email, name, phone
        if (cleanKey === 'email address' || cleanKey === 'e-mail') normalizedRow['email'] = row[key];
        if (cleanKey === 'first name' || cleanKey === 'full name') normalizedRow['name'] = row[key];
        if (cleanKey === 'phone' || cleanKey === 'mobile number') normalizedRow['mobile'] = row[key];
      }
      return normalizedRow;
    });

    return normalizedData;
  }
}

export default new FileParser();
