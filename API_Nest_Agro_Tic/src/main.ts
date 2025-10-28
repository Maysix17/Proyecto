import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 1. OBTENER ORÍGENES PERMITIDOS
    // Lee la variable de entorno, que ahora contendrá una lista de URLs separadas por coma.
    // Si no existe, usa http://localhost:5173 (el origen por defecto de Vite/React).
    const rawOrigins = configService.get<string>('FRONTEND_URLS') || 'http://localhost:5173';
    
    // Convertir la cadena de texto separada por comas en un array de strings.
    const allowedOrigins = rawOrigins.split(',').map(url => url.trim());
    
    console.log('CORS Whitelist:', allowedOrigins); 

    // 2. APLICAR CONFIGURACIÓN CORS
    app.use(
        cors({
            origin: allowedOrigins, // Ahora acepta el array de URLs
            credentials: true,
        }),
    );
    
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    const port = configService.get<number>('PORT') ?? 3000;
    
    // 🌟 CAMBIO CRUCIAL: Se añade '0.0.0.0' para forzar a NestJS a escuchar en todas las interfaces de red del contenedor.
    // Esto resuelve el ERR_CONNECTION_REFUSED.
    await app.listen(port, '0.0.0.0'); 

    console.log(`Server is running on http://0.0.0.0:${port}`);
    console.log(`Accessible externally on the mapped host port: ${port}`);
}
bootstrap();