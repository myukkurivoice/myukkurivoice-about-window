import { ipcRenderer, remote, shell } from 'electron';
import * as os from 'os';
var semver = require('semver');

ipcRenderer.on('about-window:info', (_: any, info: AboutWindowInfo) => {
    const app_name = info.product_name || remote.app.getName();
    const open_home = () => shell.openExternal(info.homepage);
    const content = info.use_inner_html ? 'innerHTML' : 'innerText';
    document.title = info.win_options.title || `About ${app_name}`;

    const title_elem = document.querySelector('.title') as HTMLHeadingElement;
    title_elem.innerText = `${app_name} ${remote.app.getVersion()}`;

    if (info.homepage) {
        title_elem.addEventListener('click', open_home);
        title_elem.classList.add('clickable');
        const logo_elem = document.querySelector('.logo');
        logo_elem.addEventListener('click', open_home);
        logo_elem.classList.add('clickable');
    }

    // replace with library.
    const copyright_elem = document.querySelector('.copyright') as any;
    //if (info.copyright) {
    //    copyright_elem[content] = info.copyright;
    //} else if (info.license) {
    //    copyright_elem[content] = `Distributed under ${info.license} license.`;
    //}
    if (process.mas) {
      copyright_elem[content] = `use AqKanji2Koe (Mac)\nuse AquesTalk (iOS)\nuse AquesTalk2 (Mac)\nuse AquesTalk10 (Mac)`;
    } else if (semver.gte(os.release(), '19.0.0')) {
      copyright_elem[content] = `use AqKanji2Koe (Mac)\nuse AquesTalk (iOS)\nuse AquesTalk2 (Mac)\nuse AquesTalk10 (Mac)`;
    } else {
      copyright_elem[content] = `use AqKanji2Koe (Mac)\nuse AquesTalk (Mac)\nuse AquesTalk2 (Mac)\nuse AquesTalk10 (Mac)`;
    }

    const icon_elem = document.getElementById('app-icon') as HTMLImageElement;
    icon_elem.src = info.icon_path;

    if (info.description) {
        const desc_elem = document.querySelector('.description') as any;
        desc_elem[content] = info.description;
    }

    if (info.bug_report_url) {
        const bug_report = document.querySelector('.bug-report-link') as HTMLDivElement;
        bug_report.innerText = info.bug_link_text || 'Report an issue';
        bug_report.addEventListener('click', e => {
            e.preventDefault();
            shell.openExternal(info.bug_report_url);
        });
    }

    if (info.css_path) {
        const css_paths = !Array.isArray(info.css_path) ? [info.css_path] : info.css_path;
        for (const css_path of css_paths) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = css_path;
            document.head.appendChild(link);
        }
    }

    if (info.adjust_window_size) {
        const height = document.body.scrollHeight;
        const width = document.body.scrollWidth;
        const win = remote.getCurrentWindow();
        if (height > 0 && width > 0) {
            // Note:
            // Add 30px(= about 2em) to add padding in window, if there is a close button, bit more
            if (info.show_close_button) {
                win.setContentSize(width, height + 40);
            } else {
                win.setContentSize(width, height + 52);
            }
        }
    }

    // replace with custom versions
    //if (info.use_version_info) {
    //    const versions = document.querySelector('.versions');
    //    const vs = process.versions;
    //    for (const name of ['electron', 'chrome', 'node', 'v8']) {
    //        const tr = document.createElement('tr');
    //        const name_td = document.createElement('td');
    //        name_td.innerText = name;
    //        tr.appendChild(name_td);
    //        const version_td = document.createElement('td');
    //        version_td.innerText = ' : ' + vs[name];
    //        tr.appendChild(version_td);
    //        versions.appendChild(tr);
    //    }
    //}
    if (info.use_version_info) {
        const versions = document.querySelector('.versions');
        // app version
        // run env
        // os version
        // electron, chrome, node
        const vs: { [key:string] : string } = {
          'app-version': remote.app.getVersion(),
          'runtime-env': process.mas? 'mas': 'default',
          'os-version': `${os.platform()} ${os.release()}`,
          'electron': process.versions.electron,
          'chrome': process.versions.chrome,
          'node': process.versions.node,
        };
        for (const name of ['app-version', 'runtime-env', 'os-version', 'electron', 'chrome', 'node']) {
            const tr = document.createElement('tr');
            const name_td = document.createElement('td');
            name_td.innerText = name;
            tr.appendChild(name_td);
            const version_td = document.createElement('td');
            version_td.innerText = ' : ' + vs[name];
            tr.appendChild(version_td);
            versions.appendChild(tr);
        }
    }

    if (info.show_close_button) {
        const buttons = document.querySelector('.buttons');
        const close_button = document.createElement('button');
        close_button.innerText = info.show_close_button;
        close_button.addEventListener('click', e => {
            e.preventDefault();
            remote.getCurrentWindow().close();
        });
        buttons.appendChild(close_button);
        close_button.focus();
    }
});
