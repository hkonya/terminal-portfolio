import { i18n } from '../../i18n.js';

export function neofetch(params, targetContent, commandHistory, currentPath, setPath, utils) {
    // Site açılış tarihi
    const siteStartDate = new Date('2025-02-08T20:00:00');
    const now = new Date();
    const diffTime = Math.abs(now - siteStartDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    const uptimeText = diffDays > 0 
        ? `${diffDays} gün ${diffHours} saat ${diffMinutes} dk` 
        : diffHours > 0 
            ? `${diffHours} saat ${diffMinutes} dk`
            : `${diffMinutes} dk`;

    const logo = `
<span style="color: #C01C28">            .-/+oossssoo+/-.</span>               <span style="color: #C01C28">hkonya</span>@<span style="color: #C01C28">vm</span>
<span style="color: #C01C28">        \`:+ssssssssssssssssss+:\`</span>           ---------
<span style="color: #C01C28">      -+ssssssssssssssssssyyssss+-</span>         <span style="color: #C01C28">OS</span>: Ubuntu 24.04.1 LTS aarch64
<span style="color: #C01C28">    .ossssssssssssssssss</span><b>dMMMNy</b><span style="color: #C01C28">sssso.</span>       <span style="color: #C01C28">Host</span>: VMware20,1 1
<span style="color: #C01C28">   /sssssssssss</span><b>hdmmNNmmyNMMMMh</b><span style="color: #C01C28">ssssss/</span>      <span style="color: #C01C28">Kernel</span>: 6.8.0-52-generic
<span style="color: #C01C28">  +sssssssss</span><b>hmydMMMMMMMNddddy</b><span style="color: #C01C28">ssssssss+</span>     <span style="color: #C01C28">Uptime</span>: ${uptimeText}
<span style="color: #C01C28"> /ssssssss</span><b>hNMMMyhhhyyyyhmNMMMNh</b><span style="color: #C01C28">ssssssss/</span>    <span style="color: #C01C28">Packages</span>: 1738 (dpkg), 10 (snap)
<span style="color: #C01C28">.ssssssss</span><b>dMMMNhsssssssssshNMMMd</b><span style="color: #C01C28">ssssssss.</span>   <span style="color: #C01C28">Shell</span>: bash 5.2.21
<span style="color: #C01C28">+ssss</span><b>hhhyNMMNyssssssssssssyNMMMy</b><span style="color: #C01C28">sssssss+</span>   <span style="color: #C01C28">Resolution</span>: 1280x800
<span style="color: #C01C28">oss</span><b>yNMMMNyMMhsssssssssssssshmmmh</b><span style="color: #C01C28">ssssssso</span>   <span style="color: #C01C28">DE</span>: GNOME 46.0
<span style="color: #C01C28">oss</span><b>yNMMMNyMMhsssssssssssssshmmmh</b><span style="color: #C01C28">ssssssso</span>   <span style="color: #C01C28">WM</span>: Mutter
<span style="color: #C01C28">+ssss</span><b>hhhyNMMNyssssssssssssyNMMMy</b><span style="color: #C01C28">sssssss+</span>   <span style="color: #C01C28">WM Theme</span>: Adwaita
<span style="color: #C01C28">.ssssssss</span><b>dMMMNhsssssssssshNMMMd</b><span style="color: #C01C28">ssssssss.</span>   <span style="color: #C01C28">Theme</span>: Yaru [GTK2/3]
<span style="color: #C01C28"> /ssssssss</span><b>hNMMMyhhhyyyyhdNMMMNh</b><span style="color: #C01C28">ssssssss/</span>    <span style="color: #C01C28">Icons</span>: Yaru [GTK2/3]
<span style="color: #C01C28">  +sssssssss</span><b>dmydMMMMMMMMddddy</b><span style="color: #C01C28">ssssssss+</span>     <span style="color: #C01C28">Terminal</span>: gnome-terminal
<span style="color: #C01C28">   /sssssssssss</span><b>hdmNNNNmyNMMMMh</b><span style="color: #C01C28">ssssss/</span>      <span style="color: #C01C28">CPU</span>: (2)
<span style="color: #C01C28">    .ossssssssssssssssss</span><b>dMMMNy</b><span style="color: #C01C28">sssso.</span>       <span style="color: #C01C28">GPU</span>: 00:0f.0 VMware Device 0406
<span style="color: #C01C28">      -+sssssssssssssssss</span><b>yyy</b><span style="color: #C01C28">ssss+-</span>         <span style="color: #C01C28">Memory</span>: 1357MiB / 3900MiB
<span style="color: #C01C28">        \`:+ssssssssssssssssss+:\`</span>
<span style="color: #C01C28">            .-/+oossssoo+/-.</span>               <span style="background-color: #171421">   </span><span style="background-color: #C01C28">   </span><span style="background-color: #26A269">   </span><span style="background-color: #A2734C">   </span><span style="background-color: #12488B">   </span><span style="background-color: #A347BA">   </span><span style="background-color: #2AA1B3">   </span><span style="background-color: #D0CFCC">   </span>
                                          <span style="background-color: #5E5C64">   </span><span style="background-color: #F66151">   </span><span style="background-color: #33DA7A">   </span><span style="background-color: #E9AD0C">   </span><span style="background-color: #2A7BDE">   </span><span style="background-color: #C061CB">   </span><span style="background-color: #33C7DE">   </span><span style="background-color: #FFFFFF">   </span>`;
    utils.addOutput(logo, targetContent);
} 