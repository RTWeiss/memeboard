use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod million_pixel_grid {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let grid = &mut ctx.accounts.grid;
        grid.authority = ctx.accounts.authority.key();
        grid.pixel_price = 0.1 * 10u64.pow(9); // 0.1 SOL in lamports
        Ok(())
    }

    pub fn purchase_pixels(
        ctx: Context<PurchasePixels>,
        start_x: u32,
        start_y: u32,
        end_x: u32,
        end_y: u32,
        image_url: Option<String>,
        link_url: Option<String>,
    ) -> Result<()> {
        require!(
            start_x < 1000 && end_x < 1000 && start_y < 1000 && end_y < 1000,
            GridError::InvalidCoordinates
        );

        let pixel_count = (end_x - start_x + 1) * (end_y - start_y + 1);
        let total_price = ctx.accounts.grid.pixel_price * pixel_count as u64;

        // Transfer payment
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.grid.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        token::transfer(cpi_context, total_price)?;

        // Update pixel ownership
        let pixel_data = &mut ctx.accounts.pixel_data;
        pixel_data.owner = ctx.accounts.buyer.key();
        pixel_data.start_x = start_x;
        pixel_data.start_y = start_y;
        pixel_data.end_x = end_x;
        pixel_data.end_y = end_y;
        pixel_data.image_url = image_url;
        pixel_data.link_url = link_url;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = Grid::SIZE)]
    pub grid: Account<'info, Grid>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchasePixels<'info> {
    #[account(mut)]
    pub grid: Account<'info, Grid>,
    #[account(
        init,
        payer = buyer,
        space = PixelData::SIZE,
        seeds = [
            b"pixel".as_ref(),
            &buyer.key().to_bytes(),
            &[start_x as u8, start_y as u8],
        ],
        bump
    )]
    pub pixel_data: Account<'info, PixelData>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Grid {
    pub authority: Pubkey,
    pub pixel_price: u64,
}

#[account]
pub struct PixelData {
    pub owner: Pubkey,
    pub start_x: u32,
    pub start_y: u32,
    pub end_x: u32,
    pub end_y: u32,
    pub image_url: Option<String>,
    pub link_url: Option<String>,
}

impl Grid {
    pub const SIZE: usize = 8 + 32 + 8;
}

impl PixelData {
    pub const SIZE: usize = 8 + 32 + 4 + 4 + 4 + 4 + 200 + 200;
}

#[error_code]
pub enum GridError {
    #[msg("Invalid pixel coordinates")]
    InvalidCoordinates,
}