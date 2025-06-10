const handleAddAssignment = async (assignment) => {
  try {
    await addAssignment(assignment);
    // fetchAssignments artık gerekli değil, addAssignment içinde otomatik çağrılıyor
  } catch (error) {
    console.error('Atama eklenirken hata oluştu:', error);
  }
}; 