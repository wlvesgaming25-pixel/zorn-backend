// ===== Discord Application Form =====
const webhooks = {
  freestylers: "https://discord.com/api/webhooks/1422213487542669434/lxJlUHkES5gpy64s2_GYOPXDKhBTH_j4eLktI0lBPiiAp0vMKKhV0G6k-QdBSvgiDd8L",
  cliphitters: "https://discord.com/api/webhooks/1422213442307231788/-oDiPhkJMLxW5CAILA4Ydwrcjfk1y8doonqtosgQ95prla2we6vzc1MRwfesulVhYKYM",
  editor: "https://discord.com/api/webhooks/1422213396962738216/KeGc0wuN79Bd6aCTKQmh-eI1ALdHjQluT1SFG8gYhqyXoTX9xAcEXO8ohNpafE-w6bv7",
  designer: "https://discord.com/api/webhooks/1422213298631217183/rF7Wschxfhs-9GyPOf7XnSKZoC_kK5qvF0u2GObWR8PGY7XT3LpWGQW4-q7wJNw3_phd",
  creator: "https://discord.com/api/webhooks/1422213542379130883/Zn3QzVLDmEPmYd8-Mz1kfQ1FGYQM-0I0xdYMA34v41uf7VSDG3voL_EWvLGtit6_ydf8",
  other: "https://discord.com/api/webhooks/1422213632275779629/OleZvJaxqOW02-s-lBXpRDr6rcdWD0q_reyMDzakd_mm2WKj0GDlKUrYYlxb1YNm3psq"
};

function loadForm(position) {
  const formContainer = document.getElementById('application-form');
  const reqList = document.getElementById('requirements-list');

  let requirements = [];
  let extraFields = '';

  switch(position) {
    case 'freestylers':
      requirements = [
        "Minimum 2 minute video of continuous clips",
        "Online clips only (No private matches or training)",
        "Individual clips or overedits will not be accepted"
      ];
      extraFields = `
        <div class="checkbox-group">
          <label><input type="checkbox" name="sendClips"> You will send clips for our social media</label>
          <label><input type="checkbox" name="sendReplays"> You will send in replays for our upcoming videos</label>
        </div>
      `;
      break;
    case 'cliphitters':
      requirements = [
        "Competitive clips only",
        "Minimum 1 minute montage-style submission",
        "High quality gameplay required"
      ];
      break;
    case 'editor':
      requirements = [
        "Portfolio of past edits required",
        "Knowledge of After Effects / Premiere Pro",
        "Consistent style matching Zorn branding"
      ];
      break;
    case 'designer':
      requirements = [
        "Portfolio of past designs required",
        "Ability to create thumbnails, banners, and motion graphics",
        "Experience with Photoshop/Illustrator"
      ];
      break;
    case 'creator':
      requirements = [
        "Active social media presence",
        "Consistent content schedule",
        "High engagement rate"
      ];
      break;
    case 'other':
      requirements = [
        "Explain your role clearly in your application",
        "Provide examples of past work (if applicable)"
      ];
      break;
  }

  // Show requirements
  reqList.innerHTML = requirements.map(r => `<li>${r}</li>`).join('');

  // Show "Accept" button
  formContainer.innerHTML = `
    <p>Please read the requirements. Click "Accept" to continue.</p>
    <button id="accept-btn" class="orange-btn">Accept</button>
  `;

  document.getElementById('accept-btn').addEventListener('click', () => {
    formContainer.innerHTML = `
      <form id="discord-application" class="application-form">
        <label>Discord Username</label>
        <input type="text" name="discord" placeholder="For example: zorn_user" required>

        <label>Introduce Yourself</label>
        <textarea name="intro" placeholder="Tell us about yourself" required></textarea>

        <label>Link to Your Video / Portfolio</label>
        <input type="url" name="link" placeholder="Paste your link here" required>

        <label>Anything Else You Want to Add?</label>
        <textarea name="extra" placeholder="Optional"></textarea>

        ${extraFields}

        <button type="submit" class="orange-btn">Submit Application</button>
      </form>
    `;

    // Handle form submission
    document.getElementById('discord-application').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);
      const data = {
        username: "Zorn Applications",
        embeds: [{
          title: `New ${position} Application`,
          color: 15158332,
          fields: [
            { name: "Discord Username", value: formData.get("discord") || "N/A", inline: true },
            { name: "Introduction", value: formData.get("intro") || "N/A" },
            { name: "Portfolio/Video", value: formData.get("link") || "N/A" },
            { name: "Extra Info", value: formData.get("extra") || "None" }
          ],
          footer: { text: "ZornHQ Applications" },
          timestamp: new Date()
        }]
      };

      try {
        await fetch(webhooks[position], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        formContainer.innerHTML = `<p style="color: #0f0;">✅ Application submitted successfully! We'll review it soon.</p>`;
      } catch (error) {
        formContainer.innerHTML = `<p style="color: #f00;">❌ Failed to send application. Try again later.</p>`;
      }
    });
  });
}

// ===== Observer for milestones animation =====
const milestones = document.querySelectorAll('.milestone-card');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

milestones.forEach(card => observer.observe(card));

// ===== API Calls to Backend (Server.js hosted elsewhere) =====
const API_BASE = "https://your-server-url.onrender.com/api"; // replace with your hosted server URL

async function updateRoleCount() {
  try {
    const res = await fetch(`${API_BASE}/role-count`);
    const data = await res.json();
    const el = document.getElementById("role-count");
    if(el) el.textContent = data.count;
  } catch (err) {
    console.error("Failed to fetch role count:", err);
  }
}

async function updateMemberCount() {
  try {
    const res = await fetch(`${API_BASE}/member-count`);
    const data = await res.json();
    const el = document.getElementById("member-count");
    if(el) el.textContent = data.count;
  } catch (err) {
    console.error("Failed to fetch member count:", err);
  }
}

async function updateAllFollowers() {
  try {
    const res = await fetch(`${API_BASE}/all-followers`);
    const data = await res.json();
    const el = document.getElementById("all-followers");
    if(el) el.textContent = data.count;
  } catch (err) {
    console.error("Failed to fetch social followers:", err);
  }
}

// Call API update functions
updateRoleCount();
updateMemberCount();
updateAllFollowers();
