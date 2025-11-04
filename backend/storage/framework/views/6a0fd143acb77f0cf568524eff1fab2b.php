<?php $__env->startComponent('mail::message'); ?>
# Reset Your Password

Hi <?php echo e($user->name); ?>,

We received a request to reset your password. Click the button below to set a new password.

<?php $__env->startComponent('mail::button', ['url' => $resetUrl]); ?>
Reset Password
<?php echo $__env->renderComponent(); ?>

This link will expire in <?php echo e($expiresIn); ?>. If you didn't request a password reset, you can ignore this email.

Thanks,<br>
<?php echo e(config('app.name')); ?>


<?php echo $__env->renderComponent(); ?>
<?php /**PATH /app/resources/views/emails/reset-password.blade.php ENDPATH**/ ?>