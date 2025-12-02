import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 1. Import ini

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. Wajib: Izinkan Frontend mengakses API (CORS)
  app.enableCors({
    origin: '*', // Membolehkan semua akses (Aman buat Hackathon)
  });

  // 3. Rekomendasi: Kasih awalan '/api' untuk semua endpoint
  // Jadi nanti alamatnya: localhost:3000/api/tenants
  app.setGlobalPrefix('api');

  // 4. Setup Swagger (Dokumentasi)
  const config = new DocumentBuilder()
    .setTitle('FestivaLoka API')
    .setDescription('Dokumentasi API untuk Hackathon')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // URL Swagger nanti di: http://localhost:3000/docs
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();