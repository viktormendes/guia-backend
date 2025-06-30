import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserLocation } from './entities/user-location.entity';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

@Injectable()
export class UserLocationService {
  constructor(
    @InjectRepository(UserLocation)
    private readonly userLocationRepository: Repository<UserLocation>,
  ) {}

  async updateLocation(
    userId: number,
    locationData: LocationData,
  ): Promise<UserLocation> {
    // Buscar localização existente ou criar nova
    let location = await this.userLocationRepository.findOne({
      where: { userId },
    });

    if (location) {
      // Atualizar localização existente
      Object.assign(location, locationData);
    } else {
      // Criar nova localização
      location = this.userLocationRepository.create({
        userId,
        ...locationData,
      });
    }

    return await this.userLocationRepository.save(location);
  }

  async getLocation(userId: number): Promise<UserLocation | null> {
    return await this.userLocationRepository.findOne({
      where: { userId },
    });
  }

  async getLocations(userIds: number[]): Promise<UserLocation[]> {
    return await this.userLocationRepository.find({
      where: { userId: In(userIds) },
    });
  }

  async deleteLocation(userId: number): Promise<void> {
    await this.userLocationRepository.delete({ userId });
  }

  // Calcular distância entre duas coordenadas usando a fórmula de Haversine
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Verificar se dois usuários estão próximos (dentro de uma distância específica)
  areUsersNearby(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    maxDistanceKm: number = 0.1, // 100 metros por padrão
  ): boolean {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= maxDistanceKm;
  }
}
