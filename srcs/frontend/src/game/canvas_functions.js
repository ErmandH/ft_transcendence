import Logo from './42_istanbul_image.png'

export function drawText(t, x, y, color, c, size) {
    c.fillStyle = color;
    c.font = size;
    c.fillText(t,x,y);
}

export function drawRect(x,y,w,h,color,c) {
    c.fillStyle = color;
    c.fillRect(x,y,w,h);
    c.fill();
}

export function drawCircle(x,y,r,color,c) {
    c.fillStyle = color;
    c.beginPath();
    c.arc(x,y,r,0,Math.PI*2,false);
    c.closePath();
    c.fill();
}

export function welcome_page(c) {

    const img = new Image();
    img.src = Logo;
    img.onload = () => {
        console.log('selam')
        c.drawImage(img, 40, 50);
    }; 
    

    drawText("Kurtlar Konseyi", 40, 200, 'black', c, "bold 30px Arial"); drawText("Present", 270, 200, 'black', c, "30px Arial");
    drawText("Pong Game", 40, 250, 'black', c, "30px Arial");

    drawRect(40,270,100,1,'black',c);

    drawText("How to Play?", 450, 100, 'black', c , 'bold 24px arial');
    drawText("You can control racket by mouse control. ", 450, 130, 'black', c , '18px arial');
    drawText("When one of player reach 3 point,", 450, 150, 'black', c , '18px arial');
    drawText(" match is over.", 450, 170, 'black', c , '18px arial');

    drawText("Server Status:", 40, 300, 'black', c , "18px Arial");
    //drawText("Id:", 40, 320, 'black', c, "18px Arial");
    drawText("Game Status:", 40, 340, 'black', c, "18px Arial");

    drawText("Lobby", 40, 400, 'black', c, "30px Arial");
}