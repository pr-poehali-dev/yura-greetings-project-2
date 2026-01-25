-- Добавляем поле для хранения медиафайлов (фото и видео) в формате JSON
ALTER TABLE t_p94662493_yura_greetings_proje.rooms 
ADD COLUMN media JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN t_p94662493_yura_greetings_proje.rooms.media IS 'Массив медиафайлов: [{type: "image"|"video", url: "...", order: 1}]';
