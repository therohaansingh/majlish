const API_PROXY = '/api/assignments_proxy.php'; // relative or full http://localhost/api/...

// Load departments
useEffect(() => {
  fetch(API_PROXY + '?action=getDepartments')
    .then(r => r.json())
    .then(res => {
      if (res.success) setDepartments(res.departments);
    });
}, []);

// Load existing assignment when editing user
useEffect(() => {
  if (user?.id) {
    fetch(API_PROXY + '?action=getUserAssignment&user_id=' + user.id)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.assignment) {
          setForm(prev => ({
            ...prev,
            departments: res.assignment.departments,
            permissions: res.assignment.permissions
          }));
        }
      });
  }
}, [user?.id]);

// Save
const handleSave = async () => {
  try {
    const res = await fetch(API_PROXY, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        action: 'updateAssignment',
        user_id: form.id,
        username: form.username,
        role: form.role, // optional sync
        departments: form.departments,
        permissions: form.permissions
      })
    });
    const result = await res.json();
    if (result.success) {
      alert('Assignment saved!');
      onSave(); // refresh list
      onClose();
    } else {
      alert('Error: ' + (result.error || 'Unknown'));
    }
  } catch (err) {
    alert('Failed: ' + err.message);
  }
};