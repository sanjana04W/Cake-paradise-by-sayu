export const sampleInquiries = [
  { id: 'INQ-001', customerInfo: { name: 'Nimali Perera', phone: '0771234567', email: 'nimali@gmail.com' }, eventType: 'Birthday', eventDate: '2026-07-15', targetServings: '20-25', detailedDescription: 'Pink butterfly themed cake for my daughter turning 5. Three layers, vanilla sponge, with fondant butterflies and flowers.', estimatedBudget: 'LKR 8,000 - 12,000', status: 'new', createdAt: { toDate: () => new Date('2026-06-10') }, referenceImages: [] },
  { id: 'INQ-002', customerInfo: { name: 'Kasun Fernando', phone: '0712345678', email: 'kasun@gmail.com' }, eventType: 'Wedding', eventDate: '2026-08-20', targetServings: '100+', detailedDescription: '4-tier wedding cake, white and gold theme. Couple wants fresh roses on each tier. Bride prefers vanilla and groom chocolate.', estimatedBudget: 'LKR 50,000+', status: 'quoted', createdAt: { toDate: () => new Date('2026-06-08') }, referenceImages: [] },
  { id: 'INQ-003', customerInfo: { name: 'Sachini Rathna', phone: '0769876543', email: '' }, eventType: 'Anniversary', eventDate: '2026-06-25', targetServings: '10-15', detailedDescription: 'Heart shaped red velvet cake, romantic rose design, 25th anniversary.', estimatedBudget: 'LKR 6,000', status: 'converted', createdAt: { toDate: () => new Date('2026-06-05') }, referenceImages: [] },
  { id: 'INQ-004', customerInfo: { name: 'Dilshan Mendis', phone: '0789012345', email: 'dilshan@company.lk' }, eventType: 'Corporate', eventDate: '2026-07-01', targetServings: '50-60', detailedDescription: 'Company anniversary celebration. Need branded cake with company logo on top.', estimatedBudget: 'LKR 20,000 - 25,000', status: 'new', createdAt: { toDate: () => new Date('2026-06-09') }, referenceImages: [] },
];

export const sampleCustomers = [
  { id: 'CUST-001', name: 'Nimali Perera', phone: '0771234567', email: 'nimali@gmail.com', totalOrders: 4, totalSpent: 28500, lastOrderDate: '2026-05-28', joinedDate: '2025-12-01' },
  { id: 'CUST-002', name: 'Kasun Fernando', phone: '0712345678', email: 'kasun@gmail.com', totalOrders: 2, totalSpent: 52000, lastOrderDate: '2026-04-20', joinedDate: '2026-01-15' },
  { id: 'CUST-003', name: 'Thilini Wijesinghe', phone: '0767654321', email: '', totalOrders: 8, totalSpent: 42000, lastOrderDate: '2026-06-01', joinedDate: '2025-09-10' },
  { id: 'CUST-004', name: 'Pradeep Jayawardena', phone: '0741234567', email: 'pradeep@gmail.com', totalOrders: 1, totalSpent: 3200, lastOrderDate: '2026-05-18', joinedDate: '2026-05-10' },
  { id: 'CUST-005', name: 'Amanda Senanayake', phone: '0779012345', email: 'amanda@gmail.com', totalOrders: 5, totalSpent: 19800, lastOrderDate: '2026-04-30', joinedDate: '2025-11-22' },
];
