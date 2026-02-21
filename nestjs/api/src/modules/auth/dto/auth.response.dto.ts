// Dto for auth response

import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";


export class AuthResponseDto {

    @ApiProperty({
        description: 'Access token for authentication',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;
    
    @ApiProperty({
        description: 'Refresh token for obtaining new access tokens',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;
    
    @ApiProperty({
        description: 'Authenticated user details',
        example: {
            id: 'user-123',
            email: '<EMAIL_ADDRESS>',
            firstName: 'John',
            lastName: 'Doe',
            role: 'USER'
        }
    })
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;

        role: Role
    };
}