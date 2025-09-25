// 音乐播放器类
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playlist = document.getElementById('playlist');
        this.currentTrack = document.getElementById('currentTrack');
        this.currentArtist = document.getElementById('currentArtist');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.loopBtn = document.getElementById('loopBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.progress = document.getElementById('progress');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.searchInput = document.getElementById('searchInput');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.musicList = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isLooping = false;
        this.isShuffled = false;
        this.originalPlaylist = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadMusicFiles();
        this.setVolume(70);
    }
    
    setupEventListeners() {
        // 播放/暂停按钮
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // 上一首/下一首按钮
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        
        // 循环播放按钮
        this.loopBtn.addEventListener('click', () => this.toggleLoop());
        
        // 随机播放按钮
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        
        // 进度条点击
        this.progress.parentElement.addEventListener('click', (e) => this.seekTo(e));
        
        // 音量控制
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // 搜索功能
        this.searchInput.addEventListener('input', (e) => this.filterMusic(e.target.value));
        
        // 刷新音乐列表
        this.refreshBtn.addEventListener('click', () => this.loadMusicFiles());
        
        // 音频事件监听
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('loadstart', () => this.showLoading());
        this.audio.addEventListener('canplay', () => this.hideLoading());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    // 加载音乐文件
    async loadMusicFiles() {
        this.showLoading();
        
        try {
            // 获取当前目录下的所有音频文件
            const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac'];
            const musicFiles = [];
            
            // 由于浏览器安全限制，我们需要手动列出音乐文件
            // 这里使用一个预定义的音乐文件列表
            const predefinedMusic = [
                'degenerate.m4a',
                'Friendship.m4a',
                'myheartwillgoon.m4a',
                'scarbor.m4a',
                'the brightest.m4a',
                'victory.m4a',
                '一笑江湖.m4a',
                '不为谁而作的歌.m4a',
                '冬眠.m4a',
                '别让爱凋落.m4a',
                '哪吒.m4a',
                '壁上观.m4a',
                '天下.m4a',
                '失控.m4a',
                '忘川彼岸.m4a',
                '日不落-蔡依林.m4a',
                '星辰万里只有你.m4a',
                '樱花树下的约定.m4a',
                '正版一笑江湖.m4a',
                '正版关山酒.m4a',
                '牵丝戏.m4a',
                '生生世世爱.m4a',
                '起风了.m4a',
                '辞九门回忆.m4a',
                '辞九门回忆等什么君.m4a',
                '都江堰.m4a',
                '难却.m4a',
                '风的使命.m4a'
            ];
            
            // 过滤出存在的音频文件
            for (const file of predefinedMusic) {
                if (audioExtensions.some(ext => file.toLowerCase().endsWith(ext))) {
                    musicFiles.push({
                        name: this.getDisplayName(file),
                        filename: file,
                        path: file
                    });
                }
            }
            
            this.musicList = musicFiles;
            this.originalPlaylist = [...musicFiles];
            this.renderPlaylist();
            this.hideLoading();
            
            if (musicFiles.length > 0) {
                this.loadTrack(0);
            }
            
        } catch (error) {
            console.error('加载音乐文件失败:', error);
            this.hideLoading();
            this.showMessage('加载音乐文件失败，请检查文件路径');
        }
    }
    
    // 获取显示名称（去掉扩展名）
    getDisplayName(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    }
    
    // 渲染播放列表
    renderPlaylist() {
        this.playlist.innerHTML = '';
        
        this.musicList.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = track.name;
            li.dataset.index = index;
            li.addEventListener('click', () => this.loadTrack(index));
            
            if (index === this.currentIndex) {
                li.classList.add('active');
            }
            
            this.playlist.appendChild(li);
        });
    }
    
    // 加载指定曲目
    loadTrack(index) {
        if (index < 0 || index >= this.musicList.length) return;
        
        this.currentIndex = index;
        const track = this.musicList[index];
        
        this.audio.src = track.path;
        this.currentTrack.textContent = track.name;
        this.currentArtist.textContent = '云音乐播放器';
        
        this.renderPlaylist();
        this.updatePlayPauseButton();
    }
    
    // 播放/暂停切换
    togglePlayPause() {
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    // 播放
    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
            this.addPlayingAnimation();
        }).catch(error => {
            console.error('播放失败:', error);
            this.showMessage('播放失败，请检查音频文件');
        });
    }
    
    // 暂停
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.removePlayingAnimation();
    }
    
    // 上一首
    previousTrack() {
        let newIndex = this.currentIndex - 1;
        if (newIndex < 0) {
            newIndex = this.musicList.length - 1;
        }
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    // 下一首
    nextTrack() {
        let newIndex = this.currentIndex + 1;
        if (newIndex >= this.musicList.length) {
            newIndex = 0;
        }
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    // 切换循环播放
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.loopBtn.classList.toggle('active', this.isLooping);
        this.audio.loop = this.isLooping;
    }
    
    // 切换随机播放
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active', this.isShuffled);
        
        if (this.isShuffled) {
            this.shufflePlaylist();
        } else {
            this.musicList = [...this.originalPlaylist];
            this.renderPlaylist();
        }
    }
    
    // 随机排列播放列表
    shufflePlaylist() {
        const shuffled = [...this.musicList];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.musicList = shuffled;
        this.renderPlaylist();
    }
    
    // 处理曲目结束
    handleTrackEnd() {
        if (this.isLooping) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.nextTrack();
        }
    }
    
    // 更新播放/暂停按钮
    updatePlayPauseButton() {
        const icon = this.playPauseBtn.querySelector('i');
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }
    
    // 更新进度条
    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.style.width = progress + '%';
            this.currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    // 更新总时长
    updateDuration() {
        if (this.audio.duration) {
            this.duration.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    // 格式化时间
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 跳转到指定位置
    seekTo(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = percentage * this.audio.duration;
        this.audio.currentTime = newTime;
    }
    
    // 设置音量
    setVolume(value) {
        this.audio.volume = value / 100;
    }
    
    // 搜索过滤
    filterMusic(query) {
        const filtered = this.originalPlaylist.filter(track => 
            track.name.toLowerCase().includes(query.toLowerCase())
        );
        this.musicList = filtered;
        this.renderPlaylist();
    }
    
    // 添加播放动画
    addPlayingAnimation() {
        const albumArt = document.querySelector('.album-art');
        albumArt.classList.add('playing');
    }
    
    // 移除播放动画
    removePlayingAnimation() {
        const albumArt = document.querySelector('.album-art');
        albumArt.classList.remove('playing');
    }
    
    // 显示加载动画
    showLoading() {
        this.loadingOverlay.classList.add('show');
    }
    
    // 隐藏加载动画
    hideLoading() {
        this.loadingOverlay.classList.remove('show');
    }
    
    // 显示消息
    showMessage(message) {
        // 简单的消息提示，可以后续优化
        alert(message);
    }
    
    // 键盘快捷键
    handleKeyboard(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'KeyL':
                e.preventDefault();
                this.toggleLoop();
                break;
            case 'KeyS':
                e.preventDefault();
                this.toggleShuffle();
                break;
        }
    }
}

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

// 添加一些实用功能
document.addEventListener('DOMContentLoaded', () => {
    // 添加拖拽上传功能
    const dropZone = document.querySelector('.container');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.background = '';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.background = '';
        
        const files = Array.from(e.dataTransfer.files);
        const audioFiles = files.filter(file => 
            file.type.startsWith('audio/')
        );
        
        if (audioFiles.length > 0) {
            // 这里可以添加上传文件的处理逻辑
            console.log('检测到音频文件:', audioFiles);
        }
    });
    
    // 添加全屏功能
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fullscreenBtn.className = 'control-btn';
    fullscreenBtn.title = '全屏';
    fullscreenBtn.style.position = 'fixed';
    fullscreenBtn.style.top = '20px';
    fullscreenBtn.style.right = '20px';
    fullscreenBtn.style.zIndex = '1000';
    
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
    
    document.body.appendChild(fullscreenBtn);
});
