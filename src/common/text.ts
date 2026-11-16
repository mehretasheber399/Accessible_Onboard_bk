import { BadRequestException } from '@nestjs/common';

export function requiredText(value: string, label: string, max: number): string {
  const text = value.trim();
  if (!text) {
    throw new BadRequestException(`${label} is required.`);
  }
  if (text.length > max) {
    throw new BadRequestException(`${label} is too long.`);
  }
  return text;
}

export function optionalText(value: string | undefined, max: number): string {
  const text = (value ?? '').trim();
  if (text.length > max) {
    throw new BadRequestException('That field is too long.');
  }
  return text;
}
