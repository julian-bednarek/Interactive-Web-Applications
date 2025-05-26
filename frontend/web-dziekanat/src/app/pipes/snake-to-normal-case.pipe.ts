import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'snakeToNormalCase',
    standalone: true // Make the pipe standalone
})
export class SnakeToNormalCasePipe implements PipeTransform {

    transform(value: string | null | undefined): string {
        if (!value) {
            return '-'; // Return dash if input is null, undefined, or empty
        }

        // Replace underscores with spaces, lowercase the whole string, then capitalize the first letter
        const spaced = value.toLowerCase().replace(/_/g, ' ');
        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }

} 