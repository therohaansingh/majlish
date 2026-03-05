import React, { useState, useEffect } from 'react'
import axios from 'axios'

const SystemConfiguration = () => {
  const [form, setForm] = useState({})

  useEffect(() => {
    axios.get('/api/getSystemConfig.php')
      .then(res => setForm(res.data))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()

    for (let key in form) {
      formData.append(key, form[key])
    }

    await axios.post('/api/updateSystemConfig.php', formData)
    alert("Updated Successfully")
  }

  return (
    <div className="card p-4">
      <h4>Login Page Configuration</h4>

      <form onSubmit={handleSubmit}>
        <input name="login_title" value={form.login_title || ''} onChange={handleChange} placeholder="Login Title" className="form-control mb-3" />

        <textarea name="login_paragraph" value={form.login_paragraph || ''} onChange={handleChange} placeholder="Paragraph" className="form-control mb-3" />

        <input name="login_button_text" value={form.login_button_text || ''} onChange={handleChange} placeholder="Button Text" className="form-control mb-3" />

        <input type="color" name="primary_color" value={form.primary_color || '#321fdb'} onChange={handleChange} className="form-control mb-3" />

        <label>Background Image</label>
        <input type="file" name="login_background" onChange={(e)=> setForm({...form, login_background:e.target.files[0]})} className="form-control mb-3" />

        <label>Logo</label>
        <input type="file" name="login_logo" onChange={(e)=> setForm({...form, login_logo:e.target.files[0]})} className="form-control mb-3" />

        <button className="btn btn-primary">Save Changes</button>
      </form>
    </div>
  )
}

export default SystemConfiguration