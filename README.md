# Cep Takvim Projesi

## 📄 README

### 🌐 Language Switching

<div style="text-align: center;">
    <button onclick="showEnglish()">🇬🇧 English</button>
    <button onclick="showTurkish()">🇹🇷 Türkçe</button>
</div>

### 💻 Technologies Used
<div style="text-align: center;">
    <img src="https://img.shields.io/badge/JavaScript-efc30a?style=flat&logo=javascript&logoColor=white" />
    <img src="https://img.shields.io/badge/HTML5-e44d26?style=flat&logo=html5&logoColor=white" />
    <img src="https://img.shields.io/badge/CSS3-1572b6?style=flat&logo=css3&logoColor=white" />
    <img src="https://img.shields.io/badge/React.js-61DAFB?style=flat&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
</div>

### 📜 Project Description
<div id="english">
    <h3>English</h3>
    <p>This project is a calendar application that helps users manage their schedules efficiently.</p>
</div>
<div id="turkish" style="display:none;"><h3>Türkçe</h3>
    <p>Bu proje, kullanıcıların programlarını verimli bir şekilde yönetmelerine yardımcı olan bir takvim uygulamasıdır.</p>
</div>

<script>
function showEnglish() {
    document.getElementById('english').style.display = 'block';
    document.getElementById('turkish').style.display = 'none';
}
function showTurkish() {
    document.getElementById('turkish').style.display = 'block';
    document.getElementById('english').style.display = 'none';
}
</script>