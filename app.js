const { createApp } = Vue;

// Component template
const AppTemplate = `
<div class="min-h-screen pb-8">
    <!-- Header -->
    <header class="bg-white shadow-lg border-b-4 border-pink-300">
        <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="text-4xl">🌸</div>
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                        BDD Editor
                    </h1>
                </div>
                <div class="flex items-center space-x-2">
                    <button 
                        @click="undo"
                        :disabled="historyIndex <= 0"
                        :class="historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-100'"
                        class="px-4 py-2 bg-white border-2 border-pink-300 text-pink-600 rounded-full font-medium transition-all duration-200"
                    >
                        ← Quay lại
                    </button>
                    <button 
                        @click="redo"
                        :disabled="historyIndex >= history.length - 1"
                        :class="historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-100'"
                        class="px-4 py-2 bg-white border-2 border-pink-300 text-pink-600 rounded-full font-medium transition-all duration-200"
                    >
                        Tiếp theo →
                    </button>
                    <button 
                        @click="clearImage"
                        :disabled="!imageData"
                        :class="!imageData ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'"
                        class="px-4 py-2 bg-red-600 text-white rounded-full font-medium transition-all duration-200"
                    >
                        🗑️ Xóa ảnh
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Sidebar Controls -->
            <div class="lg:col-span-1 space-y-4">
                <div class="bg-white rounded-2xl shadow-xl p-6 border-2 border-pink-200">
                    <h2 class="text-xl font-bold text-pink-600 mb-4 flex items-center">
                        <span class="mr-2">⚙️</span> Điều khiển
                    </h2>
                    
                    <!-- Tabs -->
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button 
                            v-for="tab in tabs" 
                            :key="tab"
                            @click="activeTab = tab"
                            :class="activeTab === tab ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'"
                            class="px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                        >
                            {{ tab }}
                        </button>
                    </div>

                    <!-- Upload Tab -->
                    <div v-show="activeTab === 'Tải ảnh'" class="space-y-4 fade-in">
                        <div 
                            @drop.prevent="handleDrop"
                            @dragover.prevent="handleDragOver"
                            @dragleave.prevent="handleDragLeave"
                            class="border-4 border-dashed border-pink-300 rounded-xl p-8 text-center cursor-pointer hover:border-pink-500 transition-all duration-200"
                            :class="{ 'drag-over': isDragging }"
                        >
                            <input 
                                type="file" 
                                @change="handleFileSelect" 
                                accept="image/*"
                                class="hidden"
                                ref="fileInput"
                                id="file-upload"
                            >
                            <label for="file-upload" class="cursor-pointer">
                                <div class="text-6xl mb-4">📸</div>
                                <p class="text-pink-600 font-medium mb-2">Kéo thả ảnh vào đây</p>
                                <p class="text-pink-400 text-sm">hoặc nhấn để chọn file</p>
                            </label>
                        </div>
                        
                        <button 
                            @click="saveImage"
                            :disabled="!imageData"
                            :class="!imageData ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700 pulse-hover'"
                            class="w-full px-4 py-3 bg-pink-600 text-white rounded-xl font-medium transition-all duration-200"
                        >
                            💾 Lưu ảnh
                        </button>
                        
                        <div v-if="imageData" class="space-y-2">
                            <label class="block text-sm font-medium text-pink-600">Định dạng:</label>
                            <select v-model="saveFormat" class="w-full px-3 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500">
                                <option value="png">PNG</option>
                                <option value="jpg">JPG</option>
                            </select>
                        </div>
                    </div>

                    <!-- Filters Tab -->
                    <div v-show="activeTab === 'Bộ lọc'" class="space-y-4 fade-in">
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Độ sáng: {{ filters.brightness }}%
                            </label>
                            <input 
                                type="range" 
                                v-model="filters.brightness" 
                                min="0" 
                                max="200" 
                                @input="applyFilters"
                                class="w-full"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Độ tương phản: {{ filters.contrast }}%
                            </label>
                            <input 
                                type="range" 
                                v-model="filters.contrast" 
                                min="0" 
                                max="200" 
                                @input="applyFilters"
                                class="w-full"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Độ bão hòa: {{ filters.saturation }}%
                            </label>
                            <input 
                                type="range" 
                                v-model="filters.saturation" 
                                min="0" 
                                max="200" 
                                @input="applyFilters"
                                class="w-full"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Màu xám: {{ filters.grayscale }}%
                            </label>
                            <input 
                                type="range" 
                                v-model="filters.grayscale" 
                                min="0" 
                                max="100" 
                                @input="applyFilters"
                                class="w-full"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Quang phổ màu: {{ filters.hue }}°
                            </label>
                            <input 
                                type="range" 
                                v-model="filters.hue" 
                                min="0" 
                                max="360" 
                                @input="applyFilters"
                                class="w-full"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Độ nét: {{ filters.sharpness }}%
                            </label>
                            <input 
                                type="range" 
                                v-model="filters.sharpness" 
                                min="0" 
                                max="100" 
                                @input="applyFilters"
                                class="w-full"
                            >
                        </div>
                        
                        <div class="pt-4 border-t-2 border-pink-200">
                            <label class="block text-sm font-medium text-pink-600 mb-3">Bộ lọc có sẵn:</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button 
                                    v-for="preset in presetFilters" 
                                    :key="preset.name"
                                    @click="applyPresetFilter(preset)"
                                    class="px-3 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg font-medium hover:from-pink-500 hover:to-pink-600 transition-all duration-200 text-sm"
                                >
                                    {{ preset.name }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Transform Tab -->
                    <div v-show="activeTab === 'Biến đổi'" class="space-y-4 fade-in">
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-3">Xoay & Lật:</label>
                            <div class="grid grid-cols-3 gap-2">
                                <button 
                                    @click="rotate90"
                                    :disabled="!imageData"
                                    class="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 disabled:opacity-50"
                                >
                                    ↻ 90°
                                </button>
                                <button 
                                    @click="flipHorizontal"
                                    :disabled="!imageData"
                                    class="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 disabled:opacity-50"
                                >
                                    ↔ Ngang
                                </button>
                                <button 
                                    @click="flipVertical"
                                    :disabled="!imageData"
                                    class="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 disabled:opacity-50"
                                >
                                    ↕ Dọc
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-3">Cắt ảnh:</label>
                            <div class="grid grid-cols-2 gap-2 mb-3">
                                <button 
                                    v-for="ratio in cropRatios" 
                                    :key="ratio.name"
                                    @click="setCropRatio(ratio)"
                                    :disabled="!imageData"
                                    class="px-3 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-all duration-200 text-sm disabled:opacity-50"
                                >
                                    {{ ratio.name }}
                                </button>
                            </div>
                            <button 
                                @click="toggleCropMode"
                                :disabled="!imageData"
                                :class="cropMode ? 'bg-pink-700' : 'bg-pink-500'"
                                class="w-full px-4 py-2 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 disabled:opacity-50"
                            >
                                {{ cropMode ? '✓ Áp dụng cắt' : '✂️ Bật chế độ cắt' }}
                            </button>
                        </div>
                    </div>

                    <!-- Stickers Tab -->
                    <div v-show="activeTab === 'Sticker'" class="space-y-4 fade-in">
                        <div class="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                            <button 
                                v-for="sticker in stickers" 
                                :key="sticker"
                                @click="addSticker(sticker)"
                                :disabled="!imageData"
                                class="text-4xl p-2 hover:bg-pink-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                            >
                                {{ sticker }}
                            </button>
                        </div>
                    </div>

                    <!-- Draw Tab -->
                    <div v-show="activeTab === 'Vẽ'" class="space-y-4 fade-in">
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">Màu vẽ:</label>
                            <input 
                                type="color" 
                                v-model="drawColor" 
                                class="w-full h-12 rounded-lg cursor-pointer"
                            >
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-2">
                                Độ dày: {{ drawWidth }}px
                            </label>
                            <input 
                                type="range" 
                                v-model="drawWidth" 
                                min="1" 
                                max="20" 
                                class="w-full"
                            >
                        </div>
                        
                        <button 
                            @click="toggleDrawMode"
                            :disabled="!imageData"
                            :class="drawMode ? 'bg-pink-700' : 'bg-pink-500'"
                            class="w-full px-4 py-2 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 disabled:opacity-50"
                        >
                            {{ drawMode ? '✓ Đang vẽ' : '✏️ Bật chế độ vẽ' }}
                        </button>
                        
                        <button 
                            @click="clearDrawing"
                            :disabled="!imageData"
                            class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                        >
                            🗑️ Xóa nét vẽ
                        </button>
                    </div>

                    <!-- Collage Tab -->
                    <div v-show="activeTab === 'Ghép ảnh'" class="space-y-4 fade-in">
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-3">Số lượng ảnh:</label>
                            <select v-model="collageCount" @change="initCollage" class="w-full px-3 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500">
                                <option value="2">2 ảnh</option>
                                <option value="3">3 ảnh</option>
                                <option value="4">4 ảnh</option>
                                <option value="6">6 ảnh</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-3">Mẫu khung:</label>
                            <div class="grid grid-cols-2 gap-2">
                                <button 
                                    v-for="(layout, index) in collageLayouts" 
                                    :key="index"
                                    @click="selectCollageLayout(index)"
                                    :class="selectedCollageLayout === index ? 'bg-pink-600 text-white' : 'bg-pink-100 text-pink-600'"
                                    class="px-3 py-2 rounded-lg hover:bg-pink-500 hover:text-white transition-all duration-200 text-sm"
                                >
                                    Mẫu {{ index + 1 }}
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-pink-600 mb-3">Tải ảnh cho ghép:</label>
                            <input 
                                type="file" 
                                @change="handleCollageImages" 
                                accept="image/*"
                                multiple
                                class="w-full px-3 py-2 border-2 border-pink-300 rounded-lg text-sm"
                            >
                        </div>
                        
                        <!-- Image Preview Grid with Drag & Drop -->
                        <div v-if="collageImages.length > 0">
                            <label class="block text-sm font-medium text-pink-600 mb-3">
                                Ảnh đã tải ({{ collageImages.length }}) - Kéo để sắp xếp:
                            </label>
                            <div class="grid grid-cols-3 gap-2">
                                <div 
                                    v-for="(image, index) in collageImages" 
                                    :key="index"
                                    draggable="true"
                                    @dragstart="startDragCollageImage($event, index)"
                                    @dragover.prevent
                                    @drop="dropCollageImage($event, index)"
                                    class="relative aspect-square rounded-lg overflow-hidden border-2 border-pink-300 cursor-move hover:border-pink-500 transition-all duration-200"
                                >
                                    <img :src="image" class="w-full h-full object-cover">
                                    <div class="absolute top-1 left-1 bg-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        {{ index + 1 }}
                                    </div>
                                    <button 
                                        @click="removeCollageImage(index)"
                                        class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full hover:bg-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            @click="generateCollage"
                            :disabled="collageImages.length === 0"
                            class="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all duration-200 disabled:opacity-50"
                        >
                            🎨 Tạo ghép ảnh
                        </button>
                    </div>
                </div>
            </div>

            <!-- Image Display Area -->
            <div class="lg:col-span-3">
                <div class="bg-white rounded-2xl shadow-xl p-6 border-2 border-pink-200 min-h-[600px] flex items-center justify-center">
                    <div v-if="!imageData" class="text-center fade-in">
                        <div class="text-9xl mb-6">🌸</div>
                        <h2 class="text-3xl font-bold text-pink-600 mb-3">Chào mừng đến BDD Editor!</h2>
                        <p class="text-pink-400 text-lg">Tải ảnh lên để bắt đầu chỉnh sửa</p>
                    </div>
                    
                    <div v-else class="relative w-full h-full flex items-center justify-center">
                        <div class="relative" ref="imageContainer">
                            <canvas 
                                ref="canvas" 
                                @mousedown="handleCanvasMouseDown"
                                @mousemove="handleCanvasMouseMove"
                                @mouseup="handleCanvasMouseUp"
                                @mouseleave="handleCanvasMouseUp"
                                :class="{ 'canvas-draw': drawMode }"
                                class="max-w-full max-h-[700px] rounded-lg shadow-lg"
                            ></canvas>
                            
                            <!-- Stickers overlay -->
                            <div 
                                v-for="(sticker, index) in placedStickers" 
                                :key="'sticker-' + index"
                                @mousedown="startDragSticker($event, index)"
                                :style="{ 
                                    left: sticker.x + 'px', 
                                    top: sticker.y + 'px',
                                    fontSize: sticker.size + 'px'
                                }"
                                class="sticker-item absolute"
                            >
                                {{ sticker.emoji }}
                            </div>
                            
                            <!-- Crop overlay -->
                            <div 
                                v-if="cropMode && cropArea"
                                class="crop-overlay"
                                :style="{
                                    left: cropArea.x + 'px',
                                    top: cropArea.y + 'px',
                                    width: cropArea.width + 'px',
                                    height: cropArea.height + 'px'
                                }"
                                @mousedown="startDragCrop"
                            >
                                <div class="crop-handle nw" @mousedown.stop="startResizeCrop($event, 'nw')"></div>
                                <div class="crop-handle ne" @mousedown.stop="startResizeCrop($event, 'ne')"></div>
                                <div class="crop-handle sw" @mousedown.stop="startResizeCrop($event, 'sw')"></div>
                                <div class="crop-handle se" @mousedown.stop="startResizeCrop($event, 'se')"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

createApp({
    template: AppTemplate,
    data() {
        return {
            // Image data
            imageData: null,
            originalImage: null,
            originalImageData: null, // Store the original unmodified image data

            // UI state
            activeTab: 'Tải ảnh',
            tabs: ['Tải ảnh', 'Bộ lọc', 'Biến đổi', 'Sticker', 'Vẽ', 'Ghép ảnh'],
            isDragging: false,
            saveFormat: 'png',

            // Filters
            filters: {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                grayscale: 0,
                hue: 0,
                sharpness: 0
            },

            // Preset filters
            presetFilters: [
                { name: 'Gốc', brightness: 100, contrast: 100, saturation: 100, grayscale: 0, hue: 0, sharpness: 0 },
                { name: 'Vintage', brightness: 110, contrast: 120, saturation: 80, grayscale: 0, hue: 20, sharpness: 0 },
                { name: 'B&W', brightness: 100, contrast: 110, saturation: 0, grayscale: 100, hue: 0, sharpness: 10 },
                { name: 'Sáng', brightness: 130, contrast: 90, saturation: 110, grayscale: 0, hue: 0, sharpness: 5 },
                { name: 'Tối', brightness: 70, contrast: 130, saturation: 120, grayscale: 0, hue: 0, sharpness: 0 },
                { name: 'Ấm', brightness: 105, contrast: 105, saturation: 115, grayscale: 0, hue: 15, sharpness: 0 },
                { name: 'Lạnh', brightness: 105, contrast: 105, saturation: 115, grayscale: 0, hue: 200, sharpness: 0 },
                { name: 'Mơ màng', brightness: 115, contrast: 85, saturation: 130, grayscale: 0, hue: 330, sharpness: 0 }
            ],

            // Transform
            cropMode: false,
            cropArea: null,
            cropRatios: [
                { name: 'Tự do', ratio: null },
                { name: '3:2', ratio: 3 / 2 },
                { name: '2:3', ratio: 2 / 3 },
                { name: '16:9', ratio: 16 / 9 },
                { name: '9:16', ratio: 9 / 16 },
                { name: 'Vuông', ratio: 1 }
            ],
            currentCropRatio: null,

            // Stickers
            stickers: ['😀', '😂', '😍', '🥰', '😎', '🤩', '😜', '🤗', '🥳', '😇', '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🏵️', '💮', '🌾', '⭐', '✨', '💫', '⚡', '💥', '🔥', '❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞'],
            placedStickers: [],
            draggingSticker: null,

            // Drawing
            drawMode: false,
            drawColor: '#ec4899',
            drawWidth: 3,
            isDrawing: false,
            drawingPaths: [],
            currentPath: [],

            // Collage
            collageCount: 2,
            collageImages: [],
            collageLayouts: [],
            selectedCollageLayout: 0,

            // History
            history: [],
            historyIndex: -1
        };
    },

    mounted() {
        this.initCollageLayouts();
    },

    methods: {
        // File handling
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                this.loadImage(file);
            }
        },

        handleDrop(event) {
            this.isDragging = false;
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        },

        handleDragOver(event) {
            this.isDragging = true;
        },

        handleDragLeave(event) {
            this.isDragging = false;
        },

        loadImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    this.imageData = e.target.result;
                    this.originalImageData = e.target.result; // Save original unmodified image
                    this.resetFilters();
                    this.drawingPaths = [];
                    this.placedStickers = [];
                    this.cropMode = false;
                    this.cropArea = null;
                    // Clear history when loading new image
                    this.history = [];
                    this.historyIndex = -1;
                    this.$nextTick(() => {
                        this.renderImage();
                        this.saveToHistory();
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // Canvas rendering
        renderImage() {
            if (!this.originalImage) return;

            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            // Set canvas size
            const maxWidth = 1200;
            const maxHeight = 700;
            let width = this.originalImage.width;
            let height = this.originalImage.height;

            const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
            width *= ratio;
            height *= ratio;

            canvas.width = width;
            canvas.height = height;

            // Apply filters
            ctx.filter = this.getFilterString();

            // Draw image
            ctx.drawImage(this.originalImage, 0, 0, width, height);

            // Reset filter for drawing
            ctx.filter = 'none';

            // Draw paths
            this.drawingPaths.forEach(path => {
                this.drawPath(ctx, path);
            });

            // Initialize crop area if in crop mode
            if (this.cropMode && !this.cropArea) {
                this.cropArea = {
                    x: width * 0.1,
                    y: height * 0.1,
                    width: width * 0.8,
                    height: height * 0.8
                };
            }
        },

        getFilterString() {
            const f = this.filters;
            let filterStr = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) grayscale(${f.grayscale}%) hue-rotate(${f.hue}deg)`;

            if (f.sharpness > 0) {
                // Sharpness is simulated with contrast
                const sharpnessValue = 100 + (f.sharpness * 0.5);
                filterStr += ` contrast(${sharpnessValue}%)`;
            }

            return filterStr;
        },

        // Filter methods
        applyFilters() {
            this.renderImage();
            this.saveToHistory();
        },

        applyPresetFilter(preset) {
            this.filters = { ...preset };
            this.renderImage();
            this.saveToHistory();
        },

        resetFilters() {
            this.filters = {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                grayscale: 0,
                hue: 0,
                sharpness: 0
            };
        },

        // Transform methods
        rotate90() {
            if (!this.originalImage) return;

            // Create temporary canvas
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            tempCanvas.width = this.originalImage.height;
            tempCanvas.height = this.originalImage.width;

            tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
            tempCtx.rotate(Math.PI / 2);
            tempCtx.drawImage(this.originalImage, -this.originalImage.width / 2, -this.originalImage.height / 2);

            // Update original image
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalImageData = tempCanvas.toDataURL();
                this.renderImage();
                this.saveToHistory();
            };
            img.src = tempCanvas.toDataURL();
        },

        flipHorizontal() {
            if (!this.originalImage) return;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            tempCanvas.width = this.originalImage.width;
            tempCanvas.height = this.originalImage.height;

            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(this.originalImage, 0, 0);

            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalImageData = tempCanvas.toDataURL();
                this.renderImage();
                this.saveToHistory();
            };
            img.src = tempCanvas.toDataURL();
        },

        flipVertical() {
            if (!this.originalImage) return;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            tempCanvas.width = this.originalImage.width;
            tempCanvas.height = this.originalImage.height;

            tempCtx.translate(0, tempCanvas.height);
            tempCtx.scale(1, -1);
            tempCtx.drawImage(this.originalImage, 0, 0);

            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalImageData = tempCanvas.toDataURL();
                this.renderImage();
                this.saveToHistory();
            };
            img.src = tempCanvas.toDataURL();
        },

        // Crop methods
        toggleCropMode() {
            if (this.cropMode) {
                this.applyCrop();
            } else {
                this.cropMode = true;
                const canvas = this.$refs.canvas;
                this.cropArea = {
                    x: canvas.width * 0.1,
                    y: canvas.height * 0.1,
                    width: canvas.width * 0.8,
                    height: canvas.height * 0.8
                };
            }
        },

        setCropRatio(ratio) {
            this.currentCropRatio = ratio.ratio;
            if (this.cropArea && ratio.ratio) {
                const canvas = this.$refs.canvas;
                const centerX = this.cropArea.x + this.cropArea.width / 2;
                const centerY = this.cropArea.y + this.cropArea.height / 2;

                let width, height;
                if (ratio.ratio > 1) {
                    width = Math.min(canvas.width * 0.8, this.cropArea.width);
                    height = width / ratio.ratio;
                } else {
                    height = Math.min(canvas.height * 0.8, this.cropArea.height);
                    width = height * ratio.ratio;
                }

                this.cropArea = {
                    x: centerX - width / 2,
                    y: centerY - height / 2,
                    width: width,
                    height: height
                };
            }
        },

        startDragCrop(event) {
            if (!this.cropArea) return;

            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            const startCropX = this.cropArea.x;
            const startCropY = this.cropArea.y;

            const onMove = (e) => {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const canvas = this.$refs.canvas;
                const rect = canvas.getBoundingClientRect();

                // Calculate new position
                let newX = startCropX + dx;
                let newY = startCropY + dy;

                // Constrain to canvas bounds
                newX = Math.max(0, Math.min(newX, canvas.width - this.cropArea.width));
                newY = Math.max(0, Math.min(newY, canvas.height - this.cropArea.height));

                this.cropArea.x = newX;
                this.cropArea.y = newY;
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },

        startResizeCrop(event, handle) {
            if (!this.cropArea) return;

            event.preventDefault();
            const startX = event.clientX;
            const startY = event.clientY;
            const startCrop = { ...this.cropArea };

            const onMove = (e) => {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                const canvas = this.$refs.canvas;
                let newX = startCrop.x;
                let newY = startCrop.y;
                let newWidth = startCrop.width;
                let newHeight = startCrop.height;

                // Handle different resize directions
                if (handle === 'nw') {
                    newX = startCrop.x + dx;
                    newY = startCrop.y + dy;
                    newWidth = startCrop.width - dx;
                    newHeight = startCrop.height - dy;
                } else if (handle === 'ne') {
                    newY = startCrop.y + dy;
                    newWidth = startCrop.width + dx;
                    newHeight = startCrop.height - dy;
                } else if (handle === 'sw') {
                    newX = startCrop.x + dx;
                    newWidth = startCrop.width - dx;
                    newHeight = startCrop.height + dy;
                } else if (handle === 'se') {
                    newWidth = startCrop.width + dx;
                    newHeight = startCrop.height + dy;
                }

                // Apply aspect ratio if set
                if (this.currentCropRatio) {
                    if (handle === 'se' || handle === 'nw') {
                        newHeight = newWidth / this.currentCropRatio;
                    } else if (handle === 'ne' || handle === 'sw') {
                        newWidth = newHeight * this.currentCropRatio;
                    }

                    // Adjust position for top/left handles
                    if (handle === 'nw') {
                        newX = startCrop.x + startCrop.width - newWidth;
                        newY = startCrop.y + startCrop.height - newHeight;
                    } else if (handle === 'ne') {
                        newY = startCrop.y + startCrop.height - newHeight;
                    } else if (handle === 'sw') {
                        newX = startCrop.x + startCrop.width - newWidth;
                    }
                }

                // Minimum size
                const minSize = 50;
                if (newWidth < minSize || newHeight < minSize) return;

                // Constrain to canvas bounds
                if (newX < 0) {
                    newWidth += newX;
                    newX = 0;
                }
                if (newY < 0) {
                    newHeight += newY;
                    newY = 0;
                }
                if (newX + newWidth > canvas.width) {
                    newWidth = canvas.width - newX;
                }
                if (newY + newHeight > canvas.height) {
                    newHeight = canvas.height - newY;
                }

                this.cropArea = {
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight
                };
            };

            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },

        applyCrop() {
            if (!this.cropArea || !this.originalImage) return;

            const canvas = this.$refs.canvas;

            // Calculate scale ratio between canvas and original image
            const scaleX = this.originalImage.width / canvas.width;
            const scaleY = this.originalImage.height / canvas.height;

            // Scale crop area to original image coordinates
            const cropX = this.cropArea.x * scaleX;
            const cropY = this.cropArea.y * scaleY;
            const cropWidth = this.cropArea.width * scaleX;
            const cropHeight = this.cropArea.height * scaleY;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;

            // Crop from original image (without filters)
            tempCtx.drawImage(
                this.originalImage,
                cropX, cropY,
                cropWidth, cropHeight,
                0, 0,
                cropWidth, cropHeight
            );

            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.originalImageData = tempCanvas.toDataURL();
                this.cropMode = false;
                this.cropArea = null;
                this.renderImage();
                this.saveToHistory();
            };
            img.src = tempCanvas.toDataURL();
        },

        // Sticker methods
        addSticker(emoji) {
            this.placedStickers.push({
                emoji: emoji,
                x: 50,
                y: 50,
                size: 48
            });
            this.saveToHistory();
        },

        startDragSticker(event, index) {
            this.draggingSticker = {
                index: index,
                startX: event.clientX,
                startY: event.clientY,
                initialX: this.placedStickers[index].x,
                initialY: this.placedStickers[index].y
            };

            const onMove = (e) => {
                if (this.draggingSticker) {
                    const dx = e.clientX - this.draggingSticker.startX;
                    const dy = e.clientY - this.draggingSticker.startY;
                    this.placedStickers[this.draggingSticker.index].x = this.draggingSticker.initialX + dx;
                    this.placedStickers[this.draggingSticker.index].y = this.draggingSticker.initialY + dy;
                }
            };

            const onUp = () => {
                this.draggingSticker = null;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                this.saveToHistory();
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        },

        // Drawing methods
        toggleDrawMode() {
            this.drawMode = !this.drawMode;
            if (!this.drawMode) {
                this.saveToHistory();
            }
        },

        handleCanvasMouseDown(event) {
            if (!this.drawMode) return;

            this.isDrawing = true;
            const rect = this.$refs.canvas.getBoundingClientRect();
            this.currentPath = [{
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                color: this.drawColor,
                width: this.drawWidth
            }];
        },

        handleCanvasMouseMove(event) {
            if (!this.isDrawing || !this.drawMode) return;

            const rect = this.$refs.canvas.getBoundingClientRect();
            this.currentPath.push({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            });

            this.renderImage();
            const ctx = this.$refs.canvas.getContext('2d');
            this.drawPath(ctx, this.currentPath);
        },

        handleCanvasMouseUp() {
            if (this.isDrawing && this.currentPath.length > 0) {
                this.drawingPaths.push([...this.currentPath]);
                this.currentPath = [];
            }
            this.isDrawing = false;
        },

        drawPath(ctx, path) {
            if (path.length < 2) return;

            ctx.strokeStyle = path[0].color;
            ctx.lineWidth = path[0].width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);

            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }

            ctx.stroke();
        },

        clearDrawing() {
            this.drawingPaths = [];
            this.renderImage();
            this.saveToHistory();
        },

        // Collage methods
        initCollageLayouts() {
            this.collageLayouts = [
                // Layout patterns for different counts
                { type: 'grid' },
                { type: 'horizontal' },
                { type: 'vertical' },
                { type: 'mixed' }
            ];
        },

        initCollage() {
            this.collageImages = [];
        },

        handleCollageImages(event) {
            const files = Array.from(event.target.files);
            this.collageImages = [];

            let loadedCount = 0;
            const totalFiles = files.length;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.collageImages.push(e.target.result);
                    loadedCount++;

                    // Auto-generate collage when all images are loaded
                    if (loadedCount === totalFiles) {
                        this.$nextTick(() => {
                            this.generateCollage();
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        },

        selectCollageLayout(index) {
            this.selectedCollageLayout = index;

            // Auto-generate collage if images are already loaded
            if (this.collageImages.length > 0) {
                this.generateCollage();
            }
        },

        startDragCollageImage(event, index) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', index);
        },

        dropCollageImage(event, dropIndex) {
            event.preventDefault();
            const dragIndex = parseInt(event.dataTransfer.getData('text/plain'));

            if (dragIndex === dropIndex) return;

            // Swap images
            const images = [...this.collageImages];
            const draggedImage = images[dragIndex];
            images.splice(dragIndex, 1);
            images.splice(dropIndex, 0, draggedImage);

            this.collageImages = images;

            // Auto-regenerate collage
            this.$nextTick(() => {
                this.generateCollage();
            });
        },

        removeCollageImage(index) {
            this.collageImages.splice(index, 1);

            // Auto-regenerate collage if there are still images
            if (this.collageImages.length > 0) {
                this.$nextTick(() => {
                    this.generateCollage();
                });
            }
        },

        generateCollage() {
            if (this.collageImages.length === 0) return;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const count = parseInt(this.collageCount);
            const images = this.collageImages.slice(0, count);

            // Set canvas size
            canvas.width = 1200;
            canvas.height = 800;

            // Fill background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Load and draw images
            let loadedCount = 0;
            const imgElements = [];

            images.forEach((src, index) => {
                const img = new Image();
                img.onload = () => {
                    imgElements[index] = img;
                    loadedCount++;

                    if (loadedCount === images.length) {
                        this.drawCollageLayout(ctx, imgElements, canvas.width, canvas.height);

                        // Convert to image data
                        const img = new Image();
                        img.onload = () => {
                            this.originalImage = img;
                            this.imageData = canvas.toDataURL();
                            this.renderImage();
                            this.saveToHistory();
                        };
                        img.src = canvas.toDataURL();
                    }
                };
                img.src = src;
            });
        },

        drawCollageLayout(ctx, images, width, height) {
            const count = images.length;
            const padding = 10;

            if (this.selectedCollageLayout === 0) {
                // Grid layout
                const cols = Math.ceil(Math.sqrt(count));
                const rows = Math.ceil(count / cols);
                const cellWidth = (width - padding * (cols + 1)) / cols;
                const cellHeight = (height - padding * (rows + 1)) / rows;

                images.forEach((img, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const x = padding + col * (cellWidth + padding);
                    const y = padding + row * (cellHeight + padding);

                    this.drawImageFit(ctx, img, x, y, cellWidth, cellHeight);
                });
            } else if (this.selectedCollageLayout === 1) {
                // Horizontal layout
                const cellWidth = (width - padding * (count + 1)) / count;
                const cellHeight = height - padding * 2;

                images.forEach((img, index) => {
                    const x = padding + index * (cellWidth + padding);
                    const y = padding;
                    this.drawImageFit(ctx, img, x, y, cellWidth, cellHeight);
                });
            } else if (this.selectedCollageLayout === 2) {
                // Vertical layout
                const cellWidth = width - padding * 2;
                const cellHeight = (height - padding * (count + 1)) / count;

                images.forEach((img, index) => {
                    const x = padding;
                    const y = padding + index * (cellHeight + padding);
                    this.drawImageFit(ctx, img, x, y, cellWidth, cellHeight);
                });
            } else {
                // Mixed layout
                if (count === 2) {
                    this.drawImageFit(ctx, images[0], padding, padding, width / 2 - padding * 1.5, height - padding * 2);
                    this.drawImageFit(ctx, images[1], width / 2 + padding * 0.5, padding, width / 2 - padding * 1.5, height - padding * 2);
                } else if (count === 3) {
                    this.drawImageFit(ctx, images[0], padding, padding, width - padding * 2, height / 2 - padding * 1.5);
                    this.drawImageFit(ctx, images[1], padding, height / 2 + padding * 0.5, width / 2 - padding * 1.5, height / 2 - padding * 1.5);
                    this.drawImageFit(ctx, images[2], width / 2 + padding * 0.5, height / 2 + padding * 0.5, width / 2 - padding * 1.5, height / 2 - padding * 1.5);
                } else {
                    // Default to grid for other counts
                    const cols = 2;
                    const rows = Math.ceil(count / cols);
                    const cellWidth = (width - padding * (cols + 1)) / cols;
                    const cellHeight = (height - padding * (rows + 1)) / rows;

                    images.forEach((img, index) => {
                        const col = index % cols;
                        const row = Math.floor(index / cols);
                        const x = padding + col * (cellWidth + padding);
                        const y = padding + row * (cellHeight + padding);
                        this.drawImageFit(ctx, img, x, y, cellWidth, cellHeight);
                    });
                }
            }
        },

        drawImageFit(ctx, img, x, y, width, height) {
            const imgRatio = img.width / img.height;
            const boxRatio = width / height;

            let drawWidth, drawHeight, drawX, drawY;

            if (imgRatio > boxRatio) {
                drawHeight = height;
                drawWidth = height * imgRatio;
                drawX = x - (drawWidth - width) / 2;
                drawY = y;
            } else {
                drawWidth = width;
                drawHeight = width / imgRatio;
                drawX = x;
                drawY = y - (drawHeight - height) / 2;
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
        },

        // History methods
        saveToHistory() {
            if (!this.$refs.canvas) return;

            const state = {
                imageData: this.$refs.canvas.toDataURL(),
                filters: { ...this.filters },
                stickers: JSON.parse(JSON.stringify(this.placedStickers)),
                drawingPaths: JSON.parse(JSON.stringify(this.drawingPaths))
            };

            // Remove future history if we're not at the end
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }

            this.history.push(state);
            this.historyIndex = this.history.length - 1;

            // Limit history to 50 states
            if (this.history.length > 50) {
                this.history.shift();
                this.historyIndex--;
            }
        },

        undo() {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.restoreFromHistory();
            }
        },

        redo() {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.restoreFromHistory();
            }
        },

        restoreFromHistory() {
            const state = this.history[this.historyIndex];
            if (!state) return;

            this.filters = { ...state.filters };
            this.placedStickers = JSON.parse(JSON.stringify(state.stickers));
            this.drawingPaths = JSON.parse(JSON.stringify(state.drawingPaths));

            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.renderImage();
            };
            img.src = state.imageData;
        },

        clearImage() {
            if (!this.imageData) return;

            // Clear all data
            this.imageData = null;
            this.originalImage = null;
            this.originalImageData = null;

            // Reset all modifications
            this.resetFilters();
            this.placedStickers = [];
            this.drawingPaths = [];
            this.cropMode = false;
            this.cropArea = null;

            // Clear history
            this.history = [];
            this.historyIndex = -1;

            // Switch back to upload tab
            this.activeTab = 'Tải ảnh';
        },

        // Save image
        saveImage() {
            if (!this.$refs.canvas) return;

            // Create final canvas with stickers
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            const canvas = this.$refs.canvas;

            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;

            // Draw main canvas
            finalCtx.drawImage(canvas, 0, 0);

            // Draw stickers
            this.placedStickers.forEach(sticker => {
                finalCtx.font = `${sticker.size}px Arial`;
                finalCtx.fillText(sticker.emoji, sticker.x, sticker.y + sticker.size);
            });

            // Convert to blob and download
            const mimeType = this.saveFormat === 'png' ? 'image/png' : 'image/jpeg';
            finalCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bdd-editor-${Date.now()}.${this.saveFormat}`;
                a.click();
                URL.revokeObjectURL(url);
            }, mimeType);
        }
    }
}).mount('#app');
