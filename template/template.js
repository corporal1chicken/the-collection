let FolderConfigs = {};
let ActiveConfig = null;
let BtnContainer = null;

window.addEventListener('DOMContentLoaded', async () => {
    const URLParams = new URLSearchParams(window.location.search);
    const ActiveFolder = URLParams.get('folder');
    
    BtnContainer = document.getElementById('btn-holder');

    try{
        const ConfigResponse = await fetch('config.json');

        if (!ConfigResponse.ok) throw new Error("Could not load config file");

        FolderConfigs = await ConfigResponse.json();
    }catch(err){
        document.getElementById('folder-title').innerText = "Config Error";
        console.error(err);

        return;
    }

    ActiveConfig = FolderConfigs[ActiveFolder];

    if(!ActiveConfig){
        document.getElementById('folder-title').innerText = "Folder not found";
        
        return;
    }

    document.getElementById('folder-title').innerText = ActiveConfig.title;
    document.getElementById('folder-desc').innerText = ActiveConfig.description;

    ShowMainMenu();
    LoadMDContent(ActiveConfig.default_article);
});

function ShowMainMenu() {
    BtnContainer.innerHTML = ''; 

    ActiveConfig.items.forEach(item => {
        if(item.type === "file"){
            const Btn = document.createElement('button');

            Btn.classList.add('article-btn');
            Btn.innerText = item.name;
            Btn.onclick = () => LoadMDContent(item.path);
            BtnContainer.appendChild(Btn);

        }else if(item.type === "folder"){
            const FolderBtn = document.createElement('button');
            FolderBtn.classList.add('folder-btn');
            FolderBtn.innerText = `${item.name}`;
            
            FolderBtn.onclick = () => {
                ShowSubMenu(item);
            };
            
            BtnContainer.appendChild(FolderBtn);
        }
    });
}

function ShowSubMenu(FolderObject) {
    BtnContainer.innerHTML = ''; 

    const BackBtn = document.createElement('button');

    BackBtn.classList.add('folder-btn');
    BackBtn.innerText = "Back";
    BackBtn.onclick = () => {
        ShowMainMenu();
        LoadMDContent(ActiveConfig.default_article);
    };

    BtnContainer.appendChild(BackBtn);

    const NestedArticles = FolderObject.articles || FolderObject.Articles;

    if (!NestedArticles || NestedArticles.length === 0) {
        console.error("No articles in this folder");
        
        return;
    }

    NestedArticles.forEach(subArticle => {
        const Btn = document.createElement('button');

        Btn.classList.add('article-btn');
        Btn.innerText = subArticle.name;
        Btn.onclick = () => LoadMDContent(subArticle.path);
        
        BtnContainer.appendChild(Btn);
    });

    LoadMDContent(NestedArticles[0].path);
}

async function LoadMDContent(FilePath) {
    const ContentContainer = document.getElementById('markdown-content');
    
    try{
        const Response = await fetch(FilePath);

        if (!Response.ok) throw new Error(`File not found: ${FilePath}`);
        
        const RawMD = await Response.text();

        ContentContainer.innerHTML = marked.parse(RawMD);
    }catch (error) {
        ContentContainer.innerHTML = `<p style="color:red;">Error loading content.</p>`;
        
        console.error(error);
    }
}