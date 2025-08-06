
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('management-container');
    const addDistroBtn = document.getElementById('add-distro-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');
    let distros = [];

    const render = () => {
        container.innerHTML = '';
        distros.forEach((distro, distroIndex) => {
            const distroEl = document.createElement('div');
            distroEl.className = 'distro-editor';
            distroEl.innerHTML = `
                <div class="distro-header">
                    <input type="text" value="${distro.name}" data-path="name" placeholder="Distro Name (e.g., Ubuntu)">
                    <input type="text" value="${distro.logo}" data-path="logo" placeholder="Logo URL">
                    <button class="move-up" data-idx="${distroIndex}">▲</button>
                    <button class="move-down" data-idx="${distroIndex}">▼</button>
                    <button class="delete-distro" data-idx="${distroIndex}">Delete Distro</button>
                </div>
                <div class="versions-editor">
                    ${distro.versions.map((v, vIdx) => `
                        <div class="version-form">
                            <input type="text" value="${v.name}" data-path="versions[${vIdx}].name" placeholder="Version Name (e.g., Ubuntu Desktop x86_64)">
                            <input type="text" value="${v.arch}" data-path="versions[${vIdx}].arch" placeholder="Architecture (e.g., x86_64)">
                            <input type="text" value="${v.path}" data-path="versions[${vIdx}].path" placeholder="Full ISO Path (e.g., /mnt/media_drive_1/isos/ubuntu/desktop)">
                            <input type="text" value="${v.checker.type}" data-path="versions[${vIdx}].checker.type" placeholder="Checker Type (e.g., ubuntu-json)">
                            <input type="text" value="${v.checker.options ? v.checker.options.flavor : ''}" data-path="versions[${vIdx}].checker.options.flavor" placeholder="Checker Option: Flavor">
                            <button class="delete-version" data-distro-idx="${distroIndex}" data-version-idx="${vIdx}">Delete Version</button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-version-btn" data-idx="${distroIndex}">Add Version</button>
            `;
            container.appendChild(distroEl);
        });
    };

    const updateState = () => {
        const newDistros = [];
        document.querySelectorAll('.distro-editor').forEach(distroEl => {
            const newDistro = { versions: [] };
            newDistro.name = distroEl.querySelector('[data-path="name"]').value;
            newDistro.logo = distroEl.querySelector('[data-path="logo"]').value;
            
            distroEl.querySelectorAll('.version-form').forEach(versionEl => {
                const newVersion = { checker: { options: {} } };
                newVersion.name = versionEl.querySelector('[data-path$="name"]').value;
                newVersion.arch = versionEl.querySelector('[data-path$="arch"]').value;
                newVersion.path = versionEl.querySelector('[data-path$="path"]').value;
                newVersion.checker.type = versionEl.querySelector('[data-path$="checker.type"]').value;
                newVersion.checker.options.flavor = versionEl.querySelector('[data-path$="checker.options.flavor"]').value;
                newDistro.versions.push(newVersion);
            });
            newDistros.push(newDistro);
        });
        distros = newDistros;
    };

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-distro')) {
            updateState();
            distros.splice(e.target.dataset.idx, 1);
            render();
        }
        if (e.target.classList.contains('delete-version')) {
            updateState();
            distros[e.target.dataset.distroIdx].versions.splice(e.target.dataset.versionIdx, 1);
            render();
        }
        if (e.target.classList.contains('add-version-btn')) {
            updateState();
            distros[e.target.dataset.idx].versions.push({ name: '', arch: '', path: '', checker: { type: '', options: { flavor: '' } } });
            render();
        }
        if (e.target.classList.contains('move-up')) {
            updateState();
            const idx = parseInt(e.target.dataset.idx);
            if (idx > 0) {
                [distros[idx], distros[idx - 1]] = [distros[idx - 1], distros[idx]];
                render();
            }
        }
        if (e.target.classList.contains('move-down')) {
            updateState();
            const idx = parseInt(e.target.dataset.idx);
            if (idx < distros.length - 1) {
                [distros[idx], distros[idx + 1]] = [distros[idx + 1], distros[idx]];
                render();
            }
        }
    });

    addDistroBtn.addEventListener('click', () => {
        updateState();
        distros.push({ name: '', logo: '', versions: [] });
        render();
    });

    saveChangesBtn.addEventListener('click', () => {
        updateState();
        fetch('/api/distros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(distros),
        }).then(res => {
            if (res.ok) alert('Changes saved successfully!');
            else alert('Failed to save changes.');
        });
    });

    fetch('/api/status')
        .then(res => res.json())
        .then(data => {
            distros = data;
            render();
        });
});
