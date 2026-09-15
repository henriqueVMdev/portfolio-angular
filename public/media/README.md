# Mídia do portfólio

O hero aceita `hero-1920-5s.webm` e `hero-1920-5s.mp4`: `app/page.tsx` detecta
quais existem e serve o WebM aos navegadores que suportam, com o MP4 de
fallback. Sem nenhum dos dois, a seção usa só `hero-1920-poster.jpg`.

Ao trocar qualquer vídeo, encode para web — não suba o arquivo de masterização:

    ffmpeg -i entrada.mov -c:v libx264 -crf 20 -preset slow \
      -pix_fmt yuv420p -movflags +faststart -an saida.mp4
    ffmpeg -i entrada.mov -c:v libvpx-vp9 -crf 32 -b:v 0 \
      -row-mt 1 -cpu-used 2 -an saida.webm

O `-an` é proposital: todos os vídeos aqui tocam mudos.
