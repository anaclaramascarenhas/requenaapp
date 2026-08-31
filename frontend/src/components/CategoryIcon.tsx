import { Grains, Leaf, Bread, Tree, Pepper, Jar, type IconProps } from '@phosphor-icons/react';
import type { ComponentType } from 'react';

const REGISTRY: Record<string, ComponentType<IconProps>> = { Grains, Leaf, Bread, Tree, Pepper, Jar };

export function CategoryIcon({ name, ...props }: IconProps & { name: string }) {
  const Icon = REGISTRY[name] ?? Grains;
  return <Icon {...props} />;
}
