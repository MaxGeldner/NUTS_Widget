type Point = {
    x: number,
    y: number
};

type Polygon = Array<Point>;
type MultiPolygon = Array<Polygon>;

export default {
    pointInPolygon (point: Point, polygon: Polygon): boolean {   
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > point.y) != (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    },

    pointInMultiPolygon (point: Point, polygon: MultiPolygon): boolean {
        return polygon.some(p => this.pointInPolygon(point, p))
    }
}